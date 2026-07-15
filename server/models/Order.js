import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeName: { type: String, required: true },
    storeSlug: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    commissionRateBps: { type: Number, required: true, min: 0, max: 10000 },
    commissionAmount: { type: Number, required: true, min: 0 },
    sellerNet: { type: Number, required: true, min: 0 },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    deliveredAt: { type: Date, default: null },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    reference: { type: String, required: true, unique: true, index: true },
    items: { type: [orderItemSchema], validate: [(items) => items.length > 0, "Order needs at least one item."] },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN", enum: ["NGN"] },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    payoutStatus: {
      type: String,
      enum: ["not_ready", "holding", "partially_paid", "paid", "held"],
      default: "not_ready",
    },
    inventoryStatus: {
      type: String,
      enum: ["pending", "committing", "committed", "attention"],
      default: "pending",
    },
    inventoryIssue: { type: String, trim: true, maxlength: 300, default: "" },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    paidAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    paystackTransactionId: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ "items.store": 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
