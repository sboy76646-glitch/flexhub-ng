import express from "express";

import {
  forgotPassword,
  loginUser,
  registerUser,
  resendVerificationOTP,
  resetPassword,
  verifyEmail,
  verifyResetOTP,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post(
  "/resend-verification-otp",
  resendVerificationOTP
);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router; 