import express from "express";

import { runGmailPaymentReconciliation } from "../controllers/gmailPaymentController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/reconcile",
  requireAuth,
  requireAdmin,
  runGmailPaymentReconciliation
);

export default router;
