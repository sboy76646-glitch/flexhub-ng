import mongoose from "mongoose";

import Product from "../models/Product.js";
import Store from "../models/Store.js";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isWebUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function parseProductFields(body) {
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const description = String(body.description || "").trim();
  const imageUrl = String(body.imageUrl || "").trim();
  const price = Number(body.price);
  const stock = Number(body.stock);
  const oldPrice = body.oldPrice === "" || body.oldPrice == null ? null : Number(body.oldPrice);

  if (!name || !category || !description || !imageUrl) {
    throw new Error("Please complete all product details.");
  }

  if (!isWebUrl(imageUrl)) {
    throw new Error("Use a valid http or https link for the product image.");
  }

  if (!Number.isInteger(price) || price < 100 || price > 1000000000) {
    throw new Error("Product price must be between ₦100 and ₦1 billion, using whole naira.");
  }

  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new Error("Stock must be a whole number between 0 and 99,999.");
  }

  if (oldPrice !== null && (!Number.isInteger(oldPrice) || oldPrice < price || oldPrice > 1000000000)) {
    throw new Error("The old price must be a whole-naira amount that is not lower than the selling price.");
  }

  return { name, category, description, imageUrl, price, oldPrice, stock };
}

function publicProduct(product) {
  const store = product.store || {};

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    image: product.imageUrl,
    price: product.price,
    oldPrice: product.oldPrice,
    stock: product.stock,
    storeId: store.slug,
    storeName: store.name,
    sellerVerified: Boolean(store.verified),
    rating: null,
    reviewCount: 0,
    deliveryEstimate: "Delivery confirmed at checkout",
  };
}

export async function listPublicProducts(req, res) {
  const approvedStoreIds = await Store.find({ status: "approved" }).distinct("_id");
  const query = { status: "approved", store: { $in: approvedStoreIds } };

  if (req.query.store) {
    const store = await Store.findOne({ slug: req.query.store, status: "approved" }).select("_id");
    if (!store) return res.json({ success: true, products: [] });
    query.store = store._id;
  }

  if (req.query.category) query.category = String(req.query.category).trim();

  if (req.query.q) {
    const safeQuery = String(req.query.q).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: safeQuery, $options: "i" } },
      { category: { $regex: safeQuery, $options: "i" } },
      { description: { $regex: safeQuery, $options: "i" } },
    ];
  }

  const products = await Product.find(query)
    .populate("store", "name slug verified")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({ success: true, products: products.map(publicProduct) });
}

export async function getPublicProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const product = await Product.findOne({ _id: req.params.productId, status: "approved" })
    .populate({ path: "store", match: { status: "approved" }, select: "name slug verified" })
    .lean();

  if (!product?.store) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  return res.json({ success: true, product: publicProduct(product) });
}

export async function listSellerProducts(req, res) {
  const products = await Product.find({ store: req.store._id })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, products });
}

export async function createSellerProduct(req, res) {
  try {
    const fields = parseProductFields(req.body);
    const baseSlug = createSlug(fields.name) || `product-${Date.now()}`;
    const duplicate = await Product.exists({ store: req.store._id, slug: baseSlug });
    const slug = duplicate ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug;

    const product = await Product.create({
      ...fields,
      slug,
      store: req.store._id,
      seller: req.user._id,
      status: req.body.saveAsDraft === true ? "draft" : "pending",
    });

    return res.status(201).json({
      success: true,
      message: product.status === "draft"
        ? "Product saved as a draft."
        : "Product submitted for admin approval.",
      product,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateSellerProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.status(404).json({ success: false, message: "Product not found in your store." });
  }

  const product = await Product.findOne({ _id: req.params.productId, store: req.store._id });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found in your store." });
  }

  if (product.status === "archived") {
    return res.status(409).json({ success: false, message: "Archived products cannot be edited." });
  }

  try {
    const fields = parseProductFields({ ...product.toObject(), ...req.body });
    const listingChanged = ["name", "category", "description", "imageUrl", "price", "oldPrice"]
      .some((field) => String(fields[field] ?? "") !== String(product[field] ?? ""));

    Object.assign(product, fields);

    const reviewRequested = req.body.submitForReview === true;
    const draftRequested = req.body.saveAsDraft === true;

    if (listingChanged || (reviewRequested && ["draft", "rejected"].includes(product.status))) {
      product.status = draftRequested ? "draft" : "pending";
      product.reviewNote = "";
      product.reviewedAt = null;
      product.reviewedBy = null;
    } else if (draftRequested && ["draft", "rejected"].includes(product.status)) {
      product.status = "draft";
    }

    await product.save();

    return res.json({
      success: true,
      message: product.status === "pending"
        ? "Changes saved and sent for approval."
        : "Product updated.",
      product,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function archiveSellerProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.status(404).json({ success: false, message: "Product not found in your store." });
  }

  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, store: req.store._id },
    { status: "archived" },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found in your store." });
  }

  return res.json({ success: true, message: "Product removed from the marketplace.", product });
}

export async function listProductsForReview(req, res) {
  const status = ["pending", "approved", "rejected", "archived", "draft"].includes(req.query.status)
    ? req.query.status
    : "pending";

  const products = await Product.find({ status })
    .populate("store", "name slug")
    .populate("seller", "firstName lastName email")
    .sort({ createdAt: 1 })
    .lean();

  return res.json({ success: true, products });
}

export async function reviewProduct(req, res) {
  const { decision, note = "" } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ success: false, message: "Choose approve or reject." });
  }

  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  if (product.status !== "pending") {
    return res.status(409).json({ success: false, message: "This product is not awaiting review." });
  }

  const storeIsApproved = await Store.exists({ _id: product.store, status: "approved" });
  if (!storeIsApproved) {
    return res.status(409).json({ success: false, message: "The seller's store is not currently approved." });
  }

  product.status = decision;
  product.reviewNote = String(note).trim();
  product.reviewedAt = new Date();
  product.reviewedBy = req.user._id;
  await product.save();

  return res.json({
    success: true,
    message: decision === "approved" ? "Product approved and published." : "Product returned to the seller.",
    product,
  });
}
