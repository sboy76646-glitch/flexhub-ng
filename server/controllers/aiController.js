import mongoose from "mongoose";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Store from "../models/Store.js";
import {
  generateListingDraft,
  getAIModel,
  getOrderSupportAnswer,
  getListingReview,
  getShoppingAdvice,
  isAIConfigured,
} from "../services/aiService.js";
import { buildSellerTrust } from "../services/trustService.js";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const shoppingRequestBuckets = new Map();

const severityWeight = {
  low: 1,
  medium: 2,
  high: 3,
};

function cleanText(value, maximum = 800) {
  return String(value || "").trim().slice(0, maximum);
}

function publicProduct(product, reviewStats, verifiedProductRate) {
  const store = product.store || {};
  const sellerTrust = buildSellerTrust(store, verifiedProductRate);

  return {
    id: String(product._id),
    name: product.name,
    category: product.category,
    description: product.description,
    image: product.imageUrl,
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
    rating: reviewStats?.averageRating
      ? Number(reviewStats.averageRating.toFixed(1))
      : null,
    verifiedPurchaseReviews: Number(reviewStats?.count || 0),
    sellerTrust,
    flexHubVerified: product.verificationStatus === "verified",
    actualImagesVerified: Boolean(product.actualImagesVerified),
  };
}

function catalogueRecord(product) {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    description: cleanText(product.description, 500),
    priceNaira: product.price,
    oldPriceNaira: product.oldPrice,
    inStock: Number(product.stock || 0) > 0,
    condition: product.condition,
    warranty: product.warranty || "not provided",
    returnWindowDays: Number(product.returnWindowDays || 0),
    dispatchTimeDays: Number(product.dispatchTimeDays || 0),
    fulfilledBy: product.fulfillmentType === "flexhub" ? "FlexHub" : "Seller",
    flexHubVerified: product.flexHubVerified,
    actualImagesVerified: product.actualImagesVerified,
    rating: product.rating,
    verifiedPurchaseReviewCount: product.verifiedPurchaseReviews,
    seller: {
      name: product.storeName,
      location: product.storeLocation,
      tier: product.sellerTrust.tier.label,
      trustScore: product.sellerTrust.score,
      completedFlexHubOrders: product.sellerTrust.completedOrders,
    },
  };
}

function queryTerms(message) {
  const ignored = new Set([
    "about",
    "and",
    "below",
    "compare",
    "for",
    "from",
    "good",
    "have",
    "need",
    "please",
    "that",
    "these",
    "this",
    "under",
    "want",
    "with",
  ]);

  return [...new Set(
    cleanText(message, 800)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 2 && !ignored.has(term))
  )].slice(0, 12);
}

function extractBudget(message) {
  const normalised = cleanText(message, 800).toLowerCase().replaceAll(",", "");
  const match = normalised.match(
    /(?:under|below|maximum|max|budget(?:\s+of)?|up\s+to)\s*(?:is\s*)?(?:₦|ngn|n)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|m|million)?/
  );

  if (!match) return null;

  const multiplier = ["k", "thousand"].includes(match[2])
    ? 1_000
    : ["m", "million"].includes(match[2])
      ? 1_000_000
      : 1;

  return Number(match[1]) * multiplier;
}

function rankCatalogue(products, message, selectedIds) {
  const terms = queryTerms(message);
  const budget = extractBudget(message);
  const selected = new Set(selectedIds);

  return [...products]
    .map((product) => {
      const name = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      const description = product.description.toLowerCase();
      let score = selected.has(product.id) ? 10_000 : 0;

      terms.forEach((term) => {
        if (name.includes(term)) score += 8;
        if (category.includes(term)) score += 5;
        if (description.includes(term)) score += 2;
      });

      if (budget) {
        score += Number(product.price) <= budget ? 4 : -3;
      }

      if (product.flexHubVerified) score += 1;
      score += Math.min(1, Number(product.rating || 0) / 5);

      return { product, score };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, 40)
    .map(({ product }) => product);
}

async function loadShoppingCatalogue(message, selectedIds) {
  const approvedStoreIds = await Store.find({ status: "approved" }).distinct("_id");
  const products = await Product.find({
    status: "approved",
    store: { $in: approvedStoreIds },
    stock: { $gt: 0 },
  })
    .populate(
      "store",
      "name slug location verificationLevel verificationChecks performance"
    )
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const productIds = products.map((product) => product._id);
  const storeIds = [...new Map(
    products.map((product) => [String(product.store?._id), product.store?._id])
  ).values()].filter(Boolean);

  const [reviewRows, storeRates] = await Promise.all([
    productIds.length > 0
      ? Review.aggregate([
          { $match: { product: { $in: productIds }, status: "published" } },
          {
            $group: {
              _id: "$product",
              averageRating: { $avg: "$rating" },
              count: { $sum: 1 },
            },
          },
        ])
      : [],
    storeIds.length > 0
      ? Product.aggregate([
          { $match: { store: { $in: storeIds }, status: "approved" } },
          {
            $group: {
              _id: "$store",
              total: { $sum: 1 },
              verified: {
                $sum: {
                  $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0],
                },
              },
            },
          },
        ])
      : [],
  ]);

  const reviewMap = new Map(reviewRows.map((row) => [String(row._id), row]));
  const rateMap = new Map(storeRates.map((row) => [
    String(row._id),
    row.total > 0 ? (row.verified / row.total) * 100 : 0,
  ]));
  const publicProducts = products.map((product) => publicProduct(
    product,
    reviewMap.get(String(product._id)),
    rateMap.get(String(product.store?._id)) || 0
  ));

  return rankCatalogue(publicProducts, message, selectedIds);
}

function uniqueAdviceRows(rows, productMap, maximum) {
  const seen = new Set();

  return rows.reduce((result, row) => {
    const productId = String(row?.productId || "");
    if (!productMap.has(productId) || seen.has(productId) || result.length >= maximum) {
      return result;
    }

    seen.add(productId);
    result.push({
      ...row,
      productId,
      product: productMap.get(productId),
    });
    return result;
  }, []);
}

export function limitShoppingAIRequests(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const recent = (shoppingRequestBuckets.get(key) || [])
    .filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "You have asked FlexGuide several questions. Please wait one minute and try again.",
    });
  }

  recent.push(now);
  shoppingRequestBuckets.set(key, recent);

  if (shoppingRequestBuckets.size > 1_000) {
    for (const [bucketKey, timestamps] of shoppingRequestBuckets.entries()) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        shoppingRequestBuckets.delete(bucketKey);
      }
    }
  }

  return next();
}

export function getAIStatus(req, res) {
  return res.json({
    success: true,
    configured: isAIConfigured(),
  });
}

export async function shopWithAI(req, res) {
  try {
    const message = cleanText(req.body?.message, 800);
    if (message.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Tell FlexGuide what you are shopping for.",
      });
    }

    const selectedProductIds = Array.isArray(req.body?.selectedProductIds)
      ? req.body.selectedProductIds
          .map(String)
          .filter((id) => mongoose.isValidObjectId(id))
          .slice(0, 4)
      : [];
    const catalogue = await loadShoppingCatalogue(message, selectedProductIds);

    if (catalogue.length === 0) {
      return res.json({
        success: true,
        answer: "There are no in-stock approved products in the marketplace yet. Please check back after sellers add products.",
        needsMoreInfo: false,
        followUpQuestion: "",
        recommendations: [],
        comparison: [],
        disclaimer: "FlexGuide recommends only; it cannot place orders or take payment.",
      });
    }

    const advice = await getShoppingAdvice({
      message,
      history: req.body?.history,
      catalogue: catalogue.map((product) => ({
        ...catalogueRecord(product),
        selectedForComparison: selectedProductIds.includes(product.id),
      })),
    });
    const productMap = new Map(catalogue.map((product) => [product.id, product]));

    return res.json({
      success: true,
      answer: cleanText(advice.answer, 2_000),
      needsMoreInfo: Boolean(advice.needsMoreInfo),
      followUpQuestion: cleanText(advice.followUpQuestion, 300),
      recommendations: uniqueAdviceRows(advice.recommendations, productMap, 5),
      comparison: uniqueAdviceRows(advice.comparison, productMap, 4),
      disclaimer: "FlexGuide recommends only; it cannot place orders, take payment or verify a listing.",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "FlexGuide could not complete this request.",
    });
  }
}

function deterministicListingFlags(product, marketContext) {
  const flags = [];
  const listingText = `${product.name}\n${product.description}`;
  const contactPattern = /(?:\+?234|0)[789]\d{9}|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:wa\.me|whatsapp|telegram|instagram|dm\s+me)/i;

  if (contactPattern.test(listingText)) {
    flags.push({
      category: "contact_information",
      severity: "high",
      title: "Possible off-platform contact details",
      detail: "The listing appears to contain contact information or an invitation to continue outside FlexHub.",
      suggestion: "Remove phone numbers, email addresses, social handles and off-platform payment requests.",
    });
  }

  if (marketContext.duplicateImageCount > 0) {
    flags.push({
      category: "duplicate_image",
      severity: "medium",
      title: "Image is already used by another listing",
      detail: `The exact image URL appears on ${marketContext.duplicateImageCount} other FlexHub listing(s).`,
      suggestion: "Confirm ownership and ask the seller for unique photos of the actual item.",
    });
  }

  if (
    marketContext.categoryMedianPrice &&
    Number(product.price) < marketContext.categoryMedianPrice * 0.35
  ) {
    flags.push({
      category: "suspicious_price",
      severity: "medium",
      title: "Price is far below the category median",
      detail: `The price is below 35% of the current ${product.category} median in the supplied marketplace sample.`,
      suggestion: "Confirm the price, condition, included accessories and whether the listing is for a complete product.",
    });
  }

  if (cleanText(product.description, 2_000).length < 80) {
    flags.push({
      category: "missing_specifications",
      severity: "medium",
      title: "Description may be too brief",
      detail: "The description is under 80 characters and may not include enough detail for a buyer to make a decision.",
      suggestion: "Add model, size/capacity, key features, included items, defects and compatibility where relevant.",
    });
  }

  return flags;
}

function normaliseFlag(flag) {
  return {
    category: flag.category,
    severity: flag.severity,
    title: cleanText(flag.title, 120),
    detail: cleanText(flag.detail, 400),
    suggestion: cleanText(flag.suggestion, 300),
  };
}

function mergeFlags(...groups) {
  const byCategory = new Map();

  groups.flat().forEach((rawFlag) => {
    if (!rawFlag?.category || !severityWeight[rawFlag.severity]) return;
    const flag = normaliseFlag(rawFlag);
    const current = byCategory.get(flag.category);

    if (!current || severityWeight[flag.severity] > severityWeight[current.severity]) {
      byCategory.set(flag.category, flag);
    }
  });

  return [...byCategory.values()].sort(
    (first, second) => severityWeight[second.severity] - severityWeight[first.severity]
  );
}

function listingScore(flags) {
  const deductions = flags.reduce((total, flag) => {
    if (flag.severity === "high") return total + 30;
    if (flag.severity === "medium") return total + 14;
    return total + 6;
  }, 0);

  return Math.max(0, 100 - deductions);
}

async function buildMarketContext(product) {
  const [sameCategoryPrices, duplicateImages] = await Promise.all([
    Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: "approved",
      price: { $gt: 0 },
    })
      .select("price")
      .limit(50)
      .lean(),
    Product.find({
      _id: { $ne: product._id },
      imageUrl: product.imageUrl,
      status: { $ne: "archived" },
    })
      .select("name store status")
      .limit(10)
      .lean(),
  ]);
  const prices = sameCategoryPrices
    .map((item) => Number(item.price))
    .filter(Number.isFinite)
    .sort((first, second) => first - second);
  const middle = Math.floor(prices.length / 2);
  const categoryMedianPrice = prices.length === 0
    ? null
    : prices.length % 2 === 0
      ? Math.round((prices[middle - 1] + prices[middle]) / 2)
      : prices[middle];

  return {
    categorySampleSize: prices.length,
    categoryMedianPrice,
    duplicateImageCount: duplicateImages.length,
    duplicateImageListings: duplicateImages.map((item) => ({
      name: cleanText(item.name, 120),
      status: item.status,
    })),
  };
}

async function reviewProductListing(product, req, res, checkedFor) {
  try {
    const marketContext = await buildMarketContext(product);
    const listing = {
      name: product.name,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      priceNaira: product.price,
      oldPriceNaira: product.oldPrice,
      stock: product.stock,
      condition: product.condition,
      warranty: product.warranty,
      returnWindowDays: product.returnWindowDays,
      dispatchTimeDays: product.dispatchTimeDays,
      fulfillmentType: product.fulfillmentType,
    };
    const aiResult = await getListingReview({ listing, marketContext });
    const flags = mergeFlags(
      deterministicListingFlags(product, marketContext),
      aiResult.flags
    );
    const score = listingScore(flags);

    product.aiReview = {
      status: flags.length === 0 ? "clear" : "needs_attention",
      score,
      summary: cleanText(aiResult.summary, 500),
      flags,
      checkedAt: new Date(),
      checkedBy: req.user._id,
      checkedFor,
      model: getAIModel(),
    };
    await product.save();

    return res.json({
      success: true,
      message: flags.length === 0
        ? "AI quality check completed with no material flags. Admin review is still required."
        : `AI quality check found ${flags.length} item${flags.length === 1 ? "" : "s"} to review.`,
      aiReview: product.aiReview,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "The AI listing check could not be completed.",
    });
  }
}

export async function reviewSellerListingWithAI(req, res) {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.status(404).json({ success: false, message: "Product not found in your store." });
  }

  const product = await Product.findOne({
    _id: req.params.productId,
    store: req.store._id,
    status: { $ne: "archived" },
  });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found in your store." });
  }

  return reviewProductListing(product, req, res, "seller");
}

export async function reviewAdminListingWithAI(req, res) {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  return reviewProductListing(product, req, res, "admin");
}


export async function createSellerListingDraft(req, res) {
  try {
    const notes = cleanText(req.body?.notes, 1400);
    if (notes.length < 12) return res.status(400).json({ success: false, message: "Add a few honest details about the product first." });
    const draft = await generateListingDraft({
      notes,
      category: cleanText(req.body?.category, 60),
      condition: cleanText(req.body?.condition, 40),
      price: Number(req.body?.price || 0) || null,
    });
    return res.json({ success: true, draft: {
      title: cleanText(draft.title, 120), category: cleanText(draft.category, 60),
      description: cleanText(draft.description, 1500), warrantySuggestion: cleanText(draft.warrantySuggestion, 160),
      buyerHighlights: (draft.buyerHighlights || []).map((x) => cleanText(x, 140)).slice(0, 6),
      missingDetails: (draft.missingDetails || []).map((x) => cleanText(x, 140)).slice(0, 8),
    }});
  } catch (error) { return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "FlexWrite could not create a listing draft." }); }
}

export async function answerCustomerOrderQuestion(req, res) {
  try {
    const question = cleanText(req.body?.question, 600);
    if (question.length < 3) return res.status(400).json({ success: false, message: "Ask a question about one of your orders." });
    const rows = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(12).lean();
    const orders = rows.map((order) => ({
      reference: order.reference, createdAt: order.createdAt, paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus, totalNaira: order.total,
      items: order.items.map((item) => ({ name: item.name, storeName: item.storeName, status: item.fulfillmentStatus, carrier: item.carrier || "", trackingNumber: item.trackingNumber || "", promisedDeliveryDate: item.promisedDeliveryDate, shippedAt: item.shippedAt, deliveredAt: item.deliveredAt, trackingEvents: (item.trackingEvents || []).slice(-5) })),
    }));
    if (!orders.length) return res.json({ success: true, answer: "You do not have any orders yet.", matchedOrderReference: "", recommendedAction: "Browse the marketplace when you are ready to shop.", needsHumanSupport: false });
    const answer = await getOrderSupportAnswer({ question, orders });
    return res.json({ success: true, answer: cleanText(answer.answer, 1500), matchedOrderReference: cleanText(answer.matchedOrderReference, 120), recommendedAction: cleanText(answer.recommendedAction, 400), needsHumanSupport: Boolean(answer.needsHumanSupport) });
  } catch (error) { return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "FlexSupport could not answer this question." }); }
}
