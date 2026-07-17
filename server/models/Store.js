import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "suspended",
        "removed",
      ],
      default: "pending",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verificationLevel: {
      type: String,
      enum: ["unverified", "bronze", "silver", "gold", "platinum"],
      default: "unverified",
      index: true,
    },

    verificationChecks: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      identity: { type: Boolean, default: false },
      address: { type: Boolean, default: false },
      business: { type: Boolean, default: false },
      physicalInspection: { type: Boolean, default: false },
    },

    performance: {
      completedOrders: { type: Number, min: 0, default: 0 },
      sellerScore: { type: Number, min: 0, max: 100, default: 0 },
      onTimeDeliveryRate: { type: Number, min: 0, max: 100, default: 0 },
      returnRate: { type: Number, min: 0, max: 100, default: 0 },
      cancellationRate: { type: Number, min: 0, max: 100, default: 0 },
      repeatCustomerRate: { type: Number, min: 0, max: 100, default: 0 },
      averageResponseMinutes: { type: Number, min: 0, default: null },
    },

    reviewNote: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ======================
       Suspension
    ====================== */

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    suspensionReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    /* ======================
       Removal
    ====================== */

    removedAt: {
      type: Date,
      default: null,
    },

    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    removalReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    /* ======================
       Commission
    ====================== */

    commissionRateBps: {
      type: Number,
      min: 0,
      max: 10000,
      default: 1000,
    },

    /* ======================
       Paystack Payout
    ====================== */

    payout: {
      status: {
        type: String,
        enum: ["unconfigured", "verified"],
        default: "unconfigured",
      },

      recipientCode: {
        type: String,
        default: "",
      },

      bankCode: {
        type: String,
        default: "",
      },

      bankName: {
        type: String,
        default: "",
      },

      accountName: {
        type: String,
        default: "",
      },

      accountLast4: {
        type: String,
        default: "",
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

storeSchema.index({ status: 1, verificationLevel: 1, createdAt: -1 });

export default mongoose.model("Store", storeSchema);
