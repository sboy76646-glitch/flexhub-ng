import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Store from "../models/Store.js";
import { createNotification } from "../services/notificationService.js";

function rating(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) throw new Error(`${label} must be between 1 and 5.`);
  return parsed;
}

function isOptionalWebUrl(value) {
  if (!value) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

async function refreshStoreReviewPerformance(storeId) {
  const [stats] = await Review.aggregate([
    { $match: { store: new mongoose.Types.ObjectId(storeId), status: "published" } },
    { $group: { _id: "$store", averageRating: { $avg: "$sellerRating" }, reviewCount: { $sum: 1 }, matchedCount: { $sum: { $cond: ["$matchedDescription", 1, 0] } } } },
  ]);
  await Store.findByIdAndUpdate(storeId, {
    "performance.averageRating": stats?.averageRating || 0,
    "performance.verifiedReviewCount": stats?.reviewCount || 0,
    "performance.productMatchRate": stats?.reviewCount ? Math.round((stats.matchedCount / stats.reviewCount) * 100) : 0,
  });
}

async function deliveredOrderForUser(productId, userId) {
  return Order.findOne({
    customer: userId,
    paymentStatus: "paid",
    items: { $elemMatch: { product: productId, fulfillmentStatus: "delivered" } },
  }).sort({ deliveredAt: -1 });
}

function reviewPayload(body) {
  const evidenceUrl = String(body.evidenceUrl || "").trim();
  if (!isOptionalWebUrl(evidenceUrl)) throw new Error("Use a valid evidence link.");
  return {
    rating: rating(body.rating, "Product rating"),
    sellerRating: rating(body.sellerRating, "Seller rating"),
    deliveryRating: rating(body.deliveryRating, "Delivery rating"),
    matchedDescription: body.matchedDescription === true,
    comment: String(body.comment || "").trim(),
    evidenceUrl,
  };
}

export async function createVerifiedReview(req, res) {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return res.status(404).json({ success: false, message: "Product not found." });
    const product = await Product.findById(productId).select("store status name").populate({ path: "store", select: "owner name" });
    if (!product || product.status !== "approved") return res.status(404).json({ success: false, message: "Product not found." });
    const order = await deliveredOrderForUser(product._id, req.user._id);
    if (!order) return res.status(403).json({ success: false, message: "Only customers with a delivered FlexHub order can review this product." });

    const review = await Review.create({ product: product._id, store: product.store._id, customer: req.user._id, order: order._id, ...reviewPayload(req.body) });
    await Promise.all([
      refreshStoreReviewPerformance(product.store._id),
      createNotification({ recipient: product.store.owner, type: "review", title: "New verified review", message: `${req.user.firstName} reviewed ${product.name}.`, link: "/seller" }),
    ]);
    return res.status(201).json({ success: true, message: "Your verified-purchase review is now live.", review });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "You have already reviewed this product from that order. You can edit your existing review instead." });
    return res.status(400).json({ success: false, message: error.message || "Unable to publish this review." });
  }
}

export async function updateMyReview(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.reviewId)) return res.status(404).json({ success: false, message: "Review not found." });
    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, customer: req.user._id },
      { $set: reviewPayload(req.body) },
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    await refreshStoreReviewPerformance(review.store);
    return res.json({ success: true, message: "Your review was updated.", review });
  } catch (error) { return res.status(400).json({ success: false, message: error.message || "Unable to update this review." }); }
}

export async function replyToReview(req, res) {
  if (!mongoose.isValidObjectId(req.params.reviewId)) return res.status(404).json({ success: false, message: "Review not found." });
  const message = String(req.body.message || "").trim();
  if (!message || message.length > 1000) return res.status(400).json({ success: false, message: "Reply must be between 1 and 1,000 characters." });
  const review = await Review.findOne({ _id: req.params.reviewId, store: req.store._id }).populate("product", "name");
  if (!review) return res.status(404).json({ success: false, message: "Review not found for your store." });
  review.sellerReply = { message, repliedAt: new Date(), repliedBy: req.user._id };
  await review.save();
  await createNotification({ recipient: review.customer, type: "review_reply", title: "Seller replied to your review", message: `${req.store.name} replied to your review of ${review.product?.name || "a product"}.`, link: `/product/${review.product?._id || review.product}` });
  return res.json({ success: true, message: "Your reply is now visible.", review });
}

export async function toggleHelpful(req, res) {
  if (!mongoose.isValidObjectId(req.params.reviewId)) return res.status(404).json({ success: false, message: "Review not found." });
  const review = await Review.findById(req.params.reviewId);
  if (!review || review.status !== "published") return res.status(404).json({ success: false, message: "Review not found." });
  const index = review.helpfulBy.findIndex((id) => String(id) === String(req.user._id));
  if (index >= 0) review.helpfulBy.splice(index, 1); else review.helpfulBy.push(req.user._id);
  await review.save();
  return res.json({ success: true, helpful: index < 0, helpfulCount: review.helpfulBy.length });
}

export async function reportReview(req, res) {
  if (!mongoose.isValidObjectId(req.params.reviewId)) return res.status(404).json({ success: false, message: "Review not found." });
  const reason = String(req.body.reason || "").trim();
  if (!reason || reason.length > 300) return res.status(400).json({ success: false, message: "Please provide a short report reason." });
  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });
  if (review.reports.some((report) => String(report.user) === String(req.user._id))) return res.status(409).json({ success: false, message: "You already reported this review." });
  review.reports.push({ user: req.user._id, reason });
  await review.save();
  return res.json({ success: true, message: "Review reported for moderation." });
}

export async function listSellerReviews(req, res) {
  const reviews = await Review.find({ store: req.store._id }).populate("customer", "firstName lastName").populate("product", "name imageUrl").sort({ createdAt: -1 }).limit(100).lean();
  return res.json({ success: true, reviews: reviews.map((review) => ({ ...review, helpfulCount: review.helpfulBy?.length || 0, reportCount: review.reports?.length || 0 })) });
}

export async function moderateReview(req, res) {
  if (!mongoose.isValidObjectId(req.params.reviewId) || !["published", "hidden"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid review moderation request." });
  const review = await Review.findByIdAndUpdate(req.params.reviewId, { status: req.body.status }, { new: true });
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });
  await refreshStoreReviewPerformance(review.store);
  return res.json({ success: true, message: `Review ${req.body.status}.`, review });
}
