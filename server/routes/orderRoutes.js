import express from "express";

import {
  createOrder,
  listAdminOrders,
  listMyOrders,
  listSellerOrders,
  updateAdminStoreOrderStatus,
  updateSellerOrderStatus,
} from "../controllers/orderController.js";
import {
  requireAdmin,
  requireApprovedSeller,
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/mine", requireAuth, listMyOrders);
router.get("/seller", requireAuth, requireApprovedSeller, listSellerOrders);
router.patch("/seller/:orderId/status", requireAuth, requireApprovedSeller, updateSellerOrderStatus);
router.get("/admin", requireAuth, requireAdmin, listAdminOrders);
router.patch(
  "/admin/:orderId/stores/:storeId/status",
  requireAuth,
  requireAdmin,
  updateAdminStoreOrderStatus
);

export default router;
