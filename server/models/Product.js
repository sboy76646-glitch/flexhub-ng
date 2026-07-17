import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    imageUrl: { type: String, required: true, trim: true, maxlength: 2048 },
    price: { type: Number, required: true, min: 100, max: 1000000000 },
    oldPrice: { type: Number, default: null, min: 100, max: 1000000000 },
    stock: { type: Number, required: true, min: 0, max: 99999, default: 0 },

    condition: {
      type: String,
      enum: ["brand_new", "open_box", "uk_used", "refurbished", "used"],
      default: "brand_new",
      index: true,
    },
    warranty: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "No warranty information provided",
    },
    returnWindowDays: {
      type: Number,
      min: 0,
      max: 30,
      default: 0,
    },
    dispatchTimeDays: {
      type: Number,
      min: 0,
      max: 30,
      default: 1,
    },
    fulfillmentType: {
      type: String,
      enum: ["seller", "flexhub"],
      default: "seller",
    },
    videoUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "listing_checked", "images_verified", "physically_inspected"],
      default: "unverified",
      index: true,
    },
    actualImagesVerified: {
      type: Boolean,
      default: false,
    },
    flexProofVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "archived"],
      default: "pending",
      index: true,
    },
    reviewNote: { type: String, trim: true, maxlength: 300, default: "" },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

productSchema.index({ store: 1, slug: 1 }, { unique: true });
productSchema.index({ status: 1, category: 1, createdAt: -1 });
productSchema.index({ status: 1, verificationStatus: 1, createdAt: -1 });

export default mongoose.model("Product", productSchema);
