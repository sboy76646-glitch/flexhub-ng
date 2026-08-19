import mongoose from "mongoose";

import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Store from "../models/Store.js";
import { buildSellerTrust } from "../services/trustService.js";

const productConditions = [
  "brand_new",
  "imported_new",
  "open_box",
  "uk_used",
  "refurbished",
  "used",
];

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

function wholeNumber(value, fieldName, minimum, maximum) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${fieldName} must be a whole number between ${minimum} and ${maximum}.`);
  }

  return parsed;
}

function parseProductFields(body) {
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const description = String(body.description || "").trim();
  const imageUrl = String(body.imageUrl || "").trim();
  const videoUrl = String(body.videoUrl || "").trim();
  const warranty = String(body.warranty || "No warranty").trim() || "No warranty";
  const price = Number(body.price);
  const stock = Number(body.stock);
  const oldPrice = body.oldPrice === "" || body.oldPrice == null ? null : Number(body.oldPrice);
  const condition = productConditions.includes(body.condition) ? body.condition : "brand_new";
  const fulfillmentType = body.fulfillmentType === "flexhub" ? "flexhub" : "seller";
  const returnWindowDays = wholeNumber(body.returnWindowDays ?? 0, "Return window", 0, 30);
  const dispatchTimeDays = wholeNumber(body.dispatchTimeDays ?? 1, "Dispatch time", 0, 30);

  if (!name || !category || !description || !imageUrl) {
    throw new Error("Please complete all product details.");
  }

  if (!isWebUrl(imageUrl)) {
    throw new Error("Use a valid http or https link for the product image.");
  }

  if (videoUrl && !isWebUrl(videoUrl)) {
    throw new Error("Use a valid http or https link for the product video.");
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

  if (warranty.length > 160) {
    throw new Error("Warranty information must be 160 characters or fewer.");
  }

  return {
    name,
    category,
    description,
    imageUrl,
    videoUrl,
    price,
    oldPrice,
    stock,
    condition,
    warranty,
    returnWindowDays,
    dispatchTimeDays,
    fulfillmentType,
  };
}

function expectedDelivery(dispatchTimeDays) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setDate(start.getDate() + Number(dispatchTimeDays || 0) + 2);
  end.setDate(end.getDate() + Number(dispatchTimeDays || 0) + 5);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function deliveryEstimateLabel(deliveryWindow) {
  if (!deliveryWindow?.start || !deliveryWindow?.end) {
    return "Confirmed at checkout";
  }

  const formatter = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  });

  return `${formatter.format(new Date(deliveryWindow.start))}–${formatter.format(new Date(deliveryWindow.end))}`;
}

async function reviewStatsForProducts(productIds) {
  if (productIds.length === 0) return new Map();

  const rows = await Review.aggregate([
    { $match: { product: { $in: productIds }, status: "published" } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [String(row._id), row]));
}

async function verifiedProductRates(storeIds) {
  if (storeIds.length === 0) return new Map();

  const rows = await Product.aggregate([
    { $match: { store: { $in: storeIds }, status: "approved" } },
    {
      $group: {
        _id: "$store",
        total: { $sum: 1 },
        verified: {
          $sum: { $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0] },
        },
      },
    },
  ]);

  return new Map(rows.map((row) => [
    String(row._id),
    row.total > 0 ? (row.verified / row.total) * 100 : 0,
  ]));
}

function publicReview(review) {
  return {
    id: review._id,
    rating: review.rating,
    sellerRating: review.sellerRating,
    deliveryRating: review.deliveryRating,
    matchedDescription: review.matchedDescription,
    comment: review.comment,
    evidenceUrl: review.evidenceUrl,
    customerName: review.customer?.firstName || "FlexHub customer",
    verifiedPurchase: true,
    createdAt: review.createdAt,
    helpfulCount: review.helpfulBy?.length || 0,
    sellerReply: review.sellerReply?.message ? {
      message: review.sellerReply.message,
      repliedAt: review.sellerReply.repliedAt,
    } : null,
  };
}

function publicProduct(product, reviewStats = {}, verifiedProductRate = 0) {
  const store = product.store || {};
  const productVerified = product.verificationStatus === "verified";
  const delivery = expectedDelivery(product.dispatchTimeDays);
  const sellerTrust = buildSellerTrust(store, verifiedProductRate);

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    image: product.imageUrl,
    videoUrl: product.videoUrl,
    price: product.price,
    oldPrice: product.oldPrice,
    stock: product.stock,
    condition: product.condition,
    warranty: product.warranty,
    returnWindowDays: product.returnWindowDays,
    dispatchTimeDays: product.dispatchTimeDays,
    fulfillmentType: product.fulfillmentType,
    storeId: store.slug,
    storeName: store.name,
    storeLocation: store.location,
    sellerVerified: sellerTrust.tier.id !== "basic",
    sellerTrust,
    rating: reviewStats.averageRating ? Number(reviewStats.averageRating.toFixed(1)) : null,
    reviewCount: Number(reviewStats.count || 0),
    verifiedPurchaseReviews: Number(reviewStats.count || 0),
    // Keep display text compatible with older cards that rendered this field directly.
    deliveryEstimate: deliveryEstimateLabel(delivery),
    deliveryWindow: delivery,
    trust: {
      productVerified,
      verificationStatus: product.verificationStatus,
      verifiedAt: product.verifiedAt,
      inspectionMethod: product.inspectionMethod,
      actualImagesVerified: Boolean(product.actualImagesVerified),
      flexProofVerified: Boolean(product.flexProofVerified && product.videoUrl),
      warranty: product.warranty,
      returnEligible: Number(product.returnWindowDays || 0) > 0,
      returnWindowDays: Number(product.returnWindowDays || 0),
      condition: product.condition,
      fulfillmentType: product.fulfillmentType,
      dispatchTimeDays: Number(product.dispatchTimeDays || 0),
    },
  };
}

export async function listPublicProducts(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(40, Math.max(8, Number.parseInt(req.query.limit, 10) || 24));
  const skip = (page - 1) * limit;
  const approvedStoreIds = await Store.find({ status: "approved", verified: true }).distinct("_id");
  const query = { status: "approved", store: { $in: approvedStoreIds } };

  if (req.query.store) {
    const store = await Store.findOne({
      slug: String(req.query.store).trim().toLowerCase(),
      status: "approved",
      verified: true,
    }).select("_id");

    if (!store) {
      return res.json({
        success: true,
        products: [],
        pagination: { page, limit, total: 0, pages: 0, hasMore: false },
        filters: { categories: [] },
      });
    }
    query.store = store._id;
  }

  if (req.query.category) query.category = String(req.query.category).trim();

  const minimumPrice = Number(req.query.minPrice);
  const maximumPrice = Number(req.query.maxPrice);
  if (Number.isFinite(minimumPrice) || Number.isFinite(maximumPrice)) {
    query.price = {};
    if (Number.isFinite(minimumPrice) && minimumPrice >= 0) query.price.$gte = minimumPrice;
    if (Number.isFinite(maximumPrice) && maximumPrice >= 0) query.price.$lte = maximumPrice;
  }

  if (req.query.inStock === "true") query.stock = { $gt: 0 };

  if (req.query.q) {
    const safeQuery = String(req.query.q).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: safeQuery, $options: "i" } },
      { category: { $regex: safeQuery, $options: "i" } },
      { description: { $regex: safeQuery, $options: "i" } },
    ];
  }

  const sortMap = {
    featured: { verificationStatus: -1, createdAt: -1 },
    newest: { createdAt: -1 },
    low: { price: 1, createdAt: -1 },
    high: { price: -1, createdAt: -1 },
  };
  const sort = sortMap[req.query.sort] || sortMap.featured;

  const categoryQuery = { status: "approved", store: { $in: approvedStoreIds } };
  if (req.query.store && query.store) categoryQuery.store = query.store;

  const [products, total, categories] = await Promise.all([
    Product.find(query)
      .select(
        "store name slug category description imageUrl videoUrl price oldPrice stock condition warranty returnWindowDays dispatchTimeDays fulfillmentType verificationStatus verifiedAt inspectionMethod actualImagesVerified flexProofVerified createdAt"
      )
      .populate(
        "store",
        "name slug verified location verificationLevel verificationChecks performance"
      )
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
    Product.distinct("category", categoryQuery),
  ]);

  const productIds = products.map((product) => product._id);
  const storeIds = [...new Map(products.map((product) => [String(product.store?._id), product.store?._id])).values()]
    .filter(Boolean);
  const [reviewStats, rates] = await Promise.all([
    reviewStatsForProducts(productIds),
    verifiedProductRates(storeIds),
  ]);

  const pages = total === 0 ? 0 : Math.ceil(total / limit);

  res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
  return res.json({
    success: true,
    products: products.map((product) => publicProduct(
      product,
      reviewStats.get(String(product._id)),
      rates.get(String(product.store?._id)) || 0
    )),
    pagination: {
      page,
      limit,
      total,
      pages,
      hasMore: page < pages,
    },
    filters: {
      categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    },
  });
}

export async function getPublicProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const product = await Product.findOne({ _id: req.params.productId, status: "approved" })
    .populate({
      path: "store",
      match: { status: "approved" },
      select: "name slug verified location verificationLevel verificationChecks performance",
    })
    .lean();

  if (!product?.store) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const [reviewRows, totalProducts, verifiedProducts, reviews] = await Promise.all([
    reviewStatsForProducts([product._id]),
    Product.countDocuments({ store: product.store._id, status: "approved" }),
    Product.countDocuments({
      store: product.store._id,
      status: "approved",
      verificationStatus: "verified",
    }),
    Review.find({ product: product._id, status: "published" })
      .populate("customer", "firstName")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const rate = totalProducts > 0 ? (verifiedProducts / totalProducts) * 100 : 0;
  const result = publicProduct(product, reviewRows.get(String(product._id)), rate);
  result.reviews = reviews.map(publicReview);

  return res.json({ success: true, product: result });
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
      verificationStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: product.status === "draft"
        ? "Product saved as a draft."
        : "Product submitted for FlexHub verification.",
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
    const verificationFields = [
      "name",
      "category",
      "description",
      "imageUrl",
      "videoUrl",
      "price",
      "oldPrice",
      "condition",
      "warranty",
      "returnWindowDays",
      "dispatchTimeDays",
      "fulfillmentType",
    ];
    const listingChanged = verificationFields
      .some((field) => String(fields[field] ?? "") !== String(product[field] ?? ""));

    Object.assign(product, fields);

    const reviewRequested = req.body.submitForReview === true;
    const draftRequested = req.body.saveAsDraft === true;
    const canResubmit = ["draft", "rejected", "changes_requested"].includes(product.status);

    if (listingChanged || (reviewRequested && canResubmit)) {
      product.status = draftRequested ? "draft" : "pending";
      product.verificationStatus = "pending";
      product.inspectionMethod = "not_inspected";
      product.actualImagesVerified = false;
      product.flexProofVerified = false;
      product.verifiedAt = null;
      product.verifiedBy = null;
      product.reviewNote = "";
      product.reviewedAt = null;
      product.reviewedBy = null;
      product.aiReview = {
        status: "not_checked",
        score: null,
        summary: "",
        flags: [],
        checkedAt: null,
        checkedBy: null,
        checkedFor: "",
        model: "",
      };
    } else if (draftRequested && canResubmit) {
      product.status = "draft";
    }

    await product.save();

    return res.json({
      success: true,
      message: product.status === "pending"
        ? "Changes saved and sent for FlexHub verification."
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
  const allowedStatuses = ["pending", "approved", "changes_requested", "rejected", "archived", "draft"];
  const status = allowedStatuses.includes(req.query.status) ? req.query.status : "pending";

  const products = await Product.find({ status })
    .populate("store", "name slug location verificationChecks performance")
    .populate("seller", "firstName lastName email")
    .populate("verifiedBy", "firstName lastName")
    .sort({ createdAt: 1 })
    .lean();

  return res.json({ success: true, products });
}

export async function reviewProduct(req, res) {
  const { decision, note = "" } = req.body;
  const allowedDecisions = ["approved", "rejected", "changes_requested"];

  if (!allowedDecisions.includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Choose approve, reject or request changes.",
    });
  }

  const cleanedNote = String(note || "").trim();
  if (["rejected", "changes_requested"].includes(decision) && !cleanedNote) {
    return res.status(400).json({
      success: false,
      message: "Tell the seller why the product needs attention.",
    });
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

  const approved = decision === "approved";
  const inspectionMethod = ["digital", "physical"].includes(req.body.inspectionMethod)
    ? req.body.inspectionMethod
    : "not_inspected";

  product.status = decision;
  product.verificationStatus = approved ? "verified" : decision;
  product.inspectionMethod = approved ? inspectionMethod : "not_inspected";
  product.actualImagesVerified = approved && req.body.actualImagesVerified === true;
  product.flexProofVerified = approved && Boolean(product.videoUrl) && req.body.flexProofVerified === true;
  product.verifiedAt = approved ? new Date() : null;
  product.verifiedBy = approved ? req.user._id : null;
  product.reviewNote = cleanedNote;
  product.reviewedAt = new Date();
  product.reviewedBy = req.user._id;
  product.verificationHistory.push({
    decision: approved ? "verified" : decision,
    note: cleanedNote,
    admin: req.user._id,
    decidedAt: new Date(),
  });
  await product.save();

  const messages = {
    approved: "Product approved and marked FlexHub Verified.",
    changes_requested: "Changes requested from the seller.",
    rejected: "Product rejected with an admin reason.",
  };

  return res.json({ success: true, message: messages[decision], product });
}
