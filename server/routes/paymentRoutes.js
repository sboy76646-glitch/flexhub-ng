import express from "express";

import {
  initializeOrderPayment,
  verifyOrderPayment,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/orders/:orderId/initialize", requireAuth, initializeOrderPayment);
router.get("/verify/:reference", requireAuth, verifyOrderPayment);

export default router;
