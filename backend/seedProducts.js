import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/shopProduct.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Comfortable wireless headphones with clear sound.",
    price: 2499,
    category: "Electronics",
    image: "🎧",
    stock: 25,
    isFeatured: true,
  },
  {
    name: "Premium Smart Watch",
    description: "Smart watch with fitness tracking features.",
    price: 3999,
    category: "Electronics",
    image: "⌚",
    stock: 15,
    isFeatured: true,
  },
  {
    name: "Casual Running Shoes",
    description: "Lightweight and comfortable running shoes.",
    price: 1999,
    category: "Fashion",
    image: "👟",
    stock: 30,
    isFeatured: true,
  },
  {
    name: "Travel Backpack",
    description: "Durable backpack for travel and daily use.",
    price: 1499,
    category: "Accessories",
    image: "🎒",
    stock: 20,
    isFeatured: false,
  },
  {
    name: "Digital Camera",
    description: "Compact digital camera for everyday photography.",
    price: 15999,
    category: "Electronics",
    image: "📷",
    stock: 10,
    isFeatured: true,
  },
  {
    name: "Classic Sunglasses",
    description: "Stylish sunglasses for everyday wear.",
    price: 999,
    category: "Accessories",
    image: "🕶️",
    stock: 40,
    isFeatured: false,
  },
];

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    
await mongoose.connect(process.env.MONGO_URI, {
  dbName: "shopsphere",
});

console.log("Seed database:", mongoose.connection.name);
console.log("Seed collection:", Product.collection.name);



    console.log("MongoDB connected successfully");

    // Prevent duplicate sample products on repeated runs.
    const existingProducts = await Product.countDocuments();

    if (existingProducts > 0) {
      console.log(
        "Products already exist. Skipping seed to protect existing data."
      );
      return;
    }

    const insertedProducts = await Product.insertMany(sampleProducts);

    console.log(
      `${insertedProducts.length} sample products inserted successfully!`
    );
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
