
import express from "express";

import { requireAuth } from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { validateProductInput } from "../utils/validateProductInput.js";
import Product from "../models/shopProduct.js";
import mongoose from "mongoose";
import { validateProductUpdate } from "../utils/validateProductUpdate.js";
const router = express.Router();

// All routes in this file require authentication
// and administrator privileges.
router.use(requireAuth);
router.use(requireAdmin);


/**
 * POST /api/admin/products
 * Create a product.
 * Authentication and administrator role required.
 */
router.post("/", async (req, res, next) => {
  try {
    // 1. Validate the incoming product data.
    const result = validateProductInput(req.body);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: result.errors,
      });
    }

    // 2. Create using only the validated fields.
    const product = await Product.create(result.value);

    // 3. Return the newly created product.
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    // Forward database or unexpected errors to
    // the existing Express error handler.
    next(error);
  }
});


/**
 * PATCH /api/admin/products/:id
 * Update selected product fields.
 * Administrator access only.
 */
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate the MongoDB product ID.
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Validate and sanitize requested changes.
    const result = validateProductUpdate(req.body);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid product update data",
        errors: result.errors,
      });
    }

    // 3. Update only approved fields.
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: result.value,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // 4. Handle products that do not exist.
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 5. Return the updated product.
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/products/:id
 * Permanently delete a product.
 * Administrator access only.
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB product ID.
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Delete the matching product.
    const deletedProduct =
      await Product.findByIdAndDelete(id);

    // 3. Handle products that do not exist.
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 4. Confirm deletion.
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      productId: deletedProduct._id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
