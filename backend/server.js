
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";

import { validateRequestOrigin } from "./middleware/validateRequestOrigin.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const isProduction = process.env.NODE_ENV === "production";

const allowedClientUrl = isProduction
  ? process.env.CLIENT_URL
  : process.env.CLIENT_URL || "http://localhost:5173";

if (!allowedClientUrl) {
  throw new Error(
    "CLIENT_URL must be configured in production"
  );
}

let allowedClientOrigin;

try {
  const parsedUrl = new URL(allowedClientUrl);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Unsupported frontend URL protocol");
  }

  if (isProduction && parsedUrl.protocol !== "https:") {
    throw new Error("Production CLIENT_URL must use HTTPS");
  }

  allowedClientOrigin = parsedUrl.origin;
} catch {
  throw new Error(
    "CLIENT_URL must be a valid frontend HTTP(S) origin"
  );
}




app.use(
  cors({
    origin: allowedClientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);




app.use(express.json());
app.use(cookieParser());

// Validate the origin of state-changing requests
app.use(validateRequestOrigin);

// ShopSphere product API

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/products", adminProductRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ShopSphere API",
    success: true,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShopSphere backend is running successfully",
  });
});


const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ShopSphere API running at http://localhost:${PORT}`);
  });
};

startServer();
