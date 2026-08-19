import express from "express";

import {
  createBankTransferOrder,
  getBankTransferConfig,
  getBankTransferOrder,
} from "../controllers/bankTransferController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/config",
  getBankTransferConfig
);

router.post(
  "/orders/:orderId",
  requireAuth,
  createBankTransferOrder
);

router.get(
  "/orders/:orderId",
  requireAuth,
  getBankTransferOrder
);

export default router;