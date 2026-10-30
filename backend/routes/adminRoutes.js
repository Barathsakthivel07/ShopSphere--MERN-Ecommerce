
import express from "express";

import Order from "../models/Order.js";

import {
  isValidOrderTransition,
} from "./orderStatusRules.js";

import mongoose from "mongoose";

import { requireAuth } from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

// All routes below require authentication AND admin role.
router.use(requireAuth);
router.use(requireAdmin);

// Temporary admin authorization test endpoint.
router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
});

router.get("/orders", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = 10;

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > 1000000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number",
      });
    }

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------
// GET /api/admin/orders/:id
// Retrieve a single customer order
// Admin access only
// -----------------------------------------

router.get("/orders/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Admin can retrieve any customer's order
    const order = await Order.findById(id)
      .populate("user", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Update an order's status.
 * Requires administrator authentication.
 */
router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body ?? {};

    // 1. Validate MongoDB Order ID.
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // 2. Validate the request body.
    if (
      typeof orderStatus !== "string" ||
      !["pending", "confirmed", "shipped", "delivered", "cancelled"]
        .includes(orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // 3. Load the current order.
    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 4. Enforce valid status transitions.
    if (!isValidOrderTransition(order.orderStatus, orderStatus)) {
      return res.status(409).json({
        success: false,
        message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    // 5. Update only if the status has not changed
    // since we read the order (atomic compare-and-set).
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        orderStatus: order.orderStatus,
      },
      {
        $set: { orderStatus },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedOrder) {
      return res.status(409).json({
        success: false,
        message: "Order status changed. Refresh and try again.",
      });
    }

    // 6. Return the updated order.
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
