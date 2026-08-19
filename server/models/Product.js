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
      enum: ["brand_new", "imported_new", "open_box", "uk_used", "refurbished", "used"],
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
    inspectionMethod: {
      type: String,
      enum: ["not_inspected", "digital", "physical"],
      default: "not_inspected",
    },

    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "changes_requested",
        "rejected",
        // Kept for existing records created before the FlexHub Trust workflow.
        "unverified",
        "listing_checked",
        "images_verified",
        "physically_inspected",
      ],
      default: "pending",
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
    verificationHistory: [
      {
        decision: {
          type: String,
          enum: ["verified", "changes_requested", "rejected"],
          required: true,
        },
        note: { type: String, trim: true, maxlength: 300, default: "" },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        decidedAt: { type: Date, default: Date.now },
      },
    ],

    aiReview: {
      status: {
        type: String,
        enum: ["not_checked", "clear", "needs_attention"],
        default: "not_checked",
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      summary: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },
      flags: [
        {
          category: {
            type: String,
            enum: [
              "image_mismatch",
              "suspicious_price",
              "missing_specifications",
              "contradictory_condition",
              "counterfeit_risk",
              "duplicate_image",
              "contact_information",
              "delivery_promise",
              "unsupported_original_claim",
              "other",
            ],
            required: true,
          },
          severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
          },
          title: { type: String, trim: true, maxlength: 120, required: true },
          detail: { type: String, trim: true, maxlength: 400, required: true },
          suggestion: { type: String, trim: true, maxlength: 300, default: "" },
        },
      ],
      checkedAt: {
        type: Date,
        default: null,
      },
      checkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      checkedFor: {
        type: String,
        enum: ["seller", "admin", ""],
        default: "",
      },
      model: {
        type: String,
        trim: true,
        maxlength: 80,
        default: "",
      },
    },

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "changes_requested", "rejected", "archived"],
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
productSchema.index({ status: 1, store: 1, createdAt: -1 });
productSchema.index({ status: 1, price: 1, createdAt: -1 });
productSchema.index({ status: 1, stock: 1, createdAt: -1 });
productSchema.index({ name: "text", category: "text", description: "text" }, { weights: { name: 8, category: 4, description: 1 } });

export default mongoose.model("Product", productSchema);
