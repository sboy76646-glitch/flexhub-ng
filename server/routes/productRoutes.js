import express from "express";

import {
  archiveSellerProduct,
  createSellerProduct,
  getPublicProduct,
  listProductsForReview,
  listPublicProducts,
  listSellerProducts,
  reviewProduct,
  updateSellerProduct,
} from "../controllers/productController.js";
import {
  requireAdmin,
  requireApprovedSeller,
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listPublicProducts);
router.get("/seller", requireAuth, requireApprovedSeller, listSellerProducts);
router.post("/seller", requireAuth, requireApprovedSeller, createSellerProduct);
router.patch("/seller/:productId", requireAuth, requireApprovedSeller, updateSellerProduct);
router.delete("/seller/:productId", requireAuth, requireApprovedSeller, archiveSellerProduct);
router.get("/admin/review", requireAuth, requireAdmin, listProductsForReview);
router.patch("/admin/review/:productId", requireAuth, requireAdmin, reviewProduct);
router.get("/:productId", getPublicProduct);

export default router;
