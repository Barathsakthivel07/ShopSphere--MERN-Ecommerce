
import express from "express";
import mongoose from "mongoose";
import Product from "../models/shopProduct.js";

const router = express.Router();

// GET /api/products
// Retrieve all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
});

// GET /api/products/:id
// Retrieve one product by its MongoDB ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product",
    });
  }
});

export default router;
