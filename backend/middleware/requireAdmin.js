
import User from "../models/User.js";

export default async function requireAdmin(req, res, next) {
  try {
    // Must run AFTER requireAuth.
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Look up the current role from MongoDB.
    // Do not trust a role supplied by the browser.
    const user = await User.findById(req.user._id)
      .select("role")
      .lean();

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
