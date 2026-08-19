import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    sellerRating: { type: Number, required: true, min: 1, max: 5 },
    deliveryRating: { type: Number, required: true, min: 1, max: 5 },
    matchedDescription: { type: Boolean, required: true },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
    evidenceUrl: { type: String, trim: true, maxlength: 2048, default: "" },
    sellerReply: {
      message: { type: String, trim: true, maxlength: 1000, default: "" },
      repliedAt: { type: Date, default: null },
      repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      reason: { type: String, trim: true, maxlength: 300, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ order: 1, product: 1, customer: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
