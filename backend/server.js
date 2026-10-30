
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


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use(cookieParser());
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
