import express from "express";

import {
  answerCustomerOrderQuestion,
  createSellerListingDraft,
  getAIStatus,
  limitShoppingAIRequests,
  reviewAdminListingWithAI,
  reviewSellerListingWithAI,
  shopWithAI,
} from "../controllers/aiController.js";
import {
  requireAdmin,
  requireApprovedSeller,
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/status", getAIStatus);
router.post("/shop-adviser", limitShoppingAIRequests, shopWithAI);
router.post("/order-support", requireAuth, limitShoppingAIRequests, answerCustomerOrderQuestion);
router.post("/seller/listing-draft", requireAuth, requireApprovedSeller, createSellerListingDraft);
router.post(
  "/seller/listings/:productId/review",
  requireAuth,
  requireApprovedSeller,
  reviewSellerListingWithAI
);
router.post(
  "/admin/listings/:productId/review",
  requireAuth,
  requireAdmin,
  reviewAdminListingWithAI
);

export default router;
