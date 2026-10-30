
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      maxlength: 100,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12,
    },
    country: {
      type: String,
      required: true,
      default: "India",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,
        message: "An order must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
