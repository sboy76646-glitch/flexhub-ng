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

export default mongoose.model("Store", storeSchema); 