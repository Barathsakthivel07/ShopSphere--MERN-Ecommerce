
import express from "express";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/shopProduct.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const MAX_ITEMS = 30;
const MAX_QUANTITY = 20;
const SHIPPING_FEE = 0; // Free shipping for now

const isValidMoney = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  Number.isSafeInteger(Math.round(value * 100)) &&
  Math.abs(value * 100 - Math.round(value * 100)) < 0.000001;

const toPaise = (value) => Math.round(value * 100);

// Protect every order endpoint.
router.use(requireAuth);

// -----------------------------------
// POST /api/orders
// Create a customer order
// -----------------------------------
router.post("/", async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body ?? {};

    // Validate cart contents.
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > MAX_ITEMS
    ) {
      return res.status(400).json({
        success: false,
        message: `Cart must contain 1 to ${MAX_ITEMS} products`,
      });
    }

    if (
      !items.every(
        (item) =>
          item &&
          typeof item === "object" &&
          mongoose.isValidObjectId(item.product) &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1 &&
          item.quantity <= MAX_QUANTITY
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID or quantity",
      });
    }

    const productIds = items.map((item) =>
      String(item.product)
    );

    // Do not allow duplicate product IDs.
    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate products are not allowed",
      });
    }

    // Validate shipping address.
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];

    if (
      !shippingAddress ||
      typeof shippingAddress !== "object" ||
      Array.isArray(shippingAddress) ||
      requiredFields.some(
        (field) =>
          typeof shippingAddress[field] !== "string" ||
          shippingAddress[field].trim().length === 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "A complete shipping address is required",
      });
    }

    // Validate field lengths before writing to MongoDB.
    const fieldLimits = {
      fullName: 100,
      phone: 20,
      addressLine1: 200,
      addressLine2: 200,
      city: 100,
      state: 100,
      postalCode: 12,
      country: 100,
    };

    const cleanAddress = {};

    for (const [field, limit] of Object.entries(fieldLimits)) {
      const value = shippingAddress[field];

      if (value !== undefined && typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `Invalid shipping field: ${field}`,
        });
      }

      if (typeof value === "string") {
        const trimmed = value.trim();

        if (trimmed.length > limit) {
          return res.status(400).json({
            success: false,
            message: `${field} is too long`,
          });
        }

        cleanAddress[field] = trimmed;
      }
    }

    cleanAddress.country =
      cleanAddress.country || "India";

    if (paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Only Cash on Delivery is supported",
      });
    }

    // Fetch authoritative product data from MongoDB.
    const products = await Product.find({
      _id: { $in: productIds },
    })
      .select("name price")
      .lean();

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable",
      });
    }

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    let subtotalPaise = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(String(item.product));

      if (!product || !isValidMoney(product.price)) {
        return res.status(400).json({
          success: false,
          message: "A product has an invalid price",
        });
      }

      const unitPricePaise = toPaise(product.price);
      subtotalPaise += unitPricePaise * item.quantity;

      if (!Number.isSafeInteger(subtotalPaise)) {
        return res.status(400).json({
          success: false,
          message: "Order total is too large",
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: unitPricePaise / 100,
      });
    }

    const shippingFeePaise = toPaise(SHIPPING_FEE);
    const totalPaise = subtotalPaise + shippingFeePaise;

    if (!Number.isSafeInteger(totalPaise)) {
      return res.status(400).json({
        success: false,
        message: "Order total is too large",
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: cleanAddress,
      paymentMethod: "COD",
      subtotal: subtotalPaise / 100,
      shippingFee: shippingFeePaise / 100,
      totalAmount: totalPaise / 100,
      orderStatus: "pending",
      paymentStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order information",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to place order",
    });
  }
});

// -----------------------------------
// GET /api/orders/my
// Get current customer's orders
// -----------------------------------
router.get("/my", async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
});

// -----------------------------------
// GET /api/orders/:id
// Get one order owned by customer
// -----------------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order",
    });
  }
});

export default router;
