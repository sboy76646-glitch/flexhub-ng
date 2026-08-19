import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Store from "../models/Store.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ success: false, message: "Please log in to continue." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Account not found." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Your session is invalid or has expired." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access is required." });
  }

  return next();
}

export async function requireApprovedSeller(req, res, next) {
  if (!["seller", "admin"].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "An approved seller account is required.",
    });
  }

  const store = await Store.findOne({ owner: req.user._id, status: "approved" });

  if (!store) {
    return res.status(403).json({
      success: false,
      message: "Your mini-store must be approved before you can use seller tools.",
    });
  }

  req.store = store;
  return next();
}
