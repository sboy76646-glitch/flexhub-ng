import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    grossAmount: { type: Number, required: true, min: 0 },
    commissionAmount: { type: Number, required: true, min: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    reference: { type: String, required: true, unique: true },
    recipientCode: { type: String, default: "" },
    transferCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["holding", "eligible", "queued", "success", "failed", "reversed", "blocked"],
      default: "holding",
      index: true,
    },
    holdUntil: { type: Date, required: true, index: true },
    failureMessage: { type: String, default: "" },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

payoutSchema.index({ store: 1, order: 1 }, { unique: true });

export default mongoose.model("Payout", payoutSchema);
