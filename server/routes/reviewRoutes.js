import express from "express";
import {
  createVerifiedReview, listSellerReviews, moderateReview, replyToReview,
  reportReview, toggleHelpful, updateMyReview,
} from "../controllers/reviewController.js";
import { requireAdmin, requireApprovedSeller, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/products/:productId", requireAuth, createVerifiedReview);
router.patch("/:reviewId", requireAuth, updateMyReview);
router.post("/:reviewId/helpful", requireAuth, toggleHelpful);
router.post("/:reviewId/report", requireAuth, reportReview);
router.get("/seller", requireAuth, requireApprovedSeller, listSellerReviews);
router.patch("/seller/:reviewId/reply", requireAuth, requireApprovedSeller, replyToReview);
router.patch("/admin/:reviewId/status", requireAuth, requireAdmin, moderateReview);
export default router;
