
import express from "express";
import { rateLimit } from "express-rate-limit";
import User from "../models/User.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { clearAuthCookie } from "../utils/authToken.js";

import {
  generateToken,
  setAuthCookie,
} from "../utils/authToken.js";


const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});


const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanName.length < 2 ||
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      password.length < 12 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid name and email, and a password of at least 12 characters (maximum 72 UTF-8 bytes)",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: "customer",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    // Validate incoming data
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanEmail.length > 254 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    // Password is select:false in the User model,
    // so explicitly include it for verification.
    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with its bcrypt hash
    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate a short-lived JWT
    const token = generateToken(user._id);

    // Store JWT in an HttpOnly cookie
    setAuthCookie(res, token);

    // Never return the password or JWT in JSON
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
});

router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.post("/logout", requireAuth, (req, res) => {
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
