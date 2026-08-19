import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    method: { type: String, enum: ["paystack", "bank_transfer"], required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed", "review_required", "expired", "refunded"],
      default: "pending",
      index: true,
    },
    reference: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "NGN", enum: ["NGN"] },
    transactionReference: { type: String, trim: true, default: "", index: true },
    externalTransactionId: { type: String, trim: true, unique: true, sparse: true },
    detectedAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    failureReason: { type: String, trim: true, maxlength: 500, default: "" },
    reviewReason: { type: String, trim: true, maxlength: 500, default: "" },
    source: { type: String, trim: true, maxlength: 80, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1, method: 1 }, { unique: true });
paymentSchema.index({ method: 1, status: 1, expiresAt: 1 });

export default mongoose.model("Payment", paymentSchema);
