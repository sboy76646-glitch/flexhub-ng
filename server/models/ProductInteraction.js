import mongoose from "mongoose";

const productInteractionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    type: { type: String, enum: ["view", "cart", "wishlist", "purchase"], required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

productInteractionSchema.index({ user: 1, type: 1, createdAt: -1 });
productInteractionSchema.index({ product: 1, type: 1, createdAt: -1 });

export default mongoose.model("ProductInteraction", productInteractionSchema);
