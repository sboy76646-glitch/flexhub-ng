import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createPayoutForDeliveredStore } from "../services/payoutService.js";

const fulfillmentRank = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
};

function sameId(left, right) {
  return String(left?._id || left) === String(right?._id || right);
}

function parseShippingAddress(value = {}) {
  const shippingAddress = {
    fullName: String(value.fullName || "").trim(),
    phone: String(value.phone || "").trim(),
    address: String(value.address || "").trim(),
    city: String(value.city || "").trim(),
    state: String(value.state || "").trim(),
  };

  if (Object.values(shippingAddress).some((field) => !field)) {
    throw new Error("Please complete the delivery address.");
  }

  if (shippingAddress.fullName.length > 120 || shippingAddress.address.length > 300) {
    throw new Error("The delivery name or address is too long.");
  }

  if (shippingAddress.phone.length > 30 || shippingAddress.city.length > 80 || shippingAddress.state.length > 80) {
    throw new Error("One or more delivery details are too long.");
  }

  return shippingAddress;
}

function updateAggregateFulfillment(order) {
  const statuses = order.items.map((item) => item.fulfillmentStatus);
  const complete = statuses.every((status) => ["delivered", "cancelled"].includes(status));

  if (statuses.every((status) => status === "cancelled")) {
    order.fulfillmentStatus = "cancelled";
  } else if (complete) {
    order.fulfillmentStatus = "delivered";
  } else if (statuses.some((status) => ["shipped", "delivered"].includes(status))) {
    order.fulfillmentStatus = "shipped";
  } else if (statuses.some((status) => status === "processing")) {
    order.fulfillmentStatus = "processing";
  } else {
    order.fulfillmentStatus = "pending";
  }

  order.deliveredAt = complete ? new Date() : null;
}

function sellerOrderView(order, storeId) {
  const items = order.items.filter((item) => sameId(item.store, storeId));

  return {
    id: order._id,
    reference: order.reference,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: items[0]?.fulfillmentStatus || "pending",
    inventoryStatus: order.inventoryStatus,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    items,
    grossAmount: items.reduce((total, item) => total + item.lineTotal, 0),
    commissionAmount: items.reduce((total, item) => total + item.commissionAmount, 0),
    sellerNet: items.reduce((total, item) => total + item.sellerNet, 0),
  };
}

export function customerOrderView(order) {
  return {
    _id: order._id,
    reference: order.reference,
    items: order.items.map((item) => ({
      product: item.product,
      storeName: item.storeName,
      storeSlug: item.storeSlug,
      name: item.name,
      imageUrl: item.imageUrl,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      fulfillmentStatus: item.fulfillmentStatus,
      deliveredAt: item.deliveredAt,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    inventoryStatus: order.inventoryStatus,
    shippingAddress: order.shippingAddress,
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
  };
}

export async function createOrder(req, res) {
  try {
    if (!Array.isArray(req.body.items) || req.body.items.length === 0 || req.body.items.length > 50) {
      return res.status(400).json({ success: false, message: "Your order must contain between 1 and 50 products." });
    }

    const quantitiesByProduct = new Map();

    for (const item of req.body.items) {
      if (!mongoose.isValidObjectId(item.productId)) {
        return res.status(400).json({ success: false, message: "One or more cart items are no longer available." });
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ success: false, message: "Each product quantity must be between 1 and 99." });
      }

      const productId = String(item.productId);
      const combinedQuantity = (quantitiesByProduct.get(productId) || 0) + quantity;
      if (combinedQuantity > 99) {
        return res.status(400).json({ success: false, message: "A single product cannot exceed 99 units per order." });
      }
      quantitiesByProduct.set(productId, combinedQuantity);
    }

    const productIds = [...quantitiesByProduct.keys()];
    const products = await Product.find({ _id: { $in: productIds }, status: "approved" })
      .populate("store");

    if (products.length !== productIds.length) {
      return res.status(409).json({ success: false, message: "A product in your cart is no longer available." });
    }

    const productById = new Map(products.map((product) => [String(product._id), product]));
    const orderItems = [];

    for (const productId of productIds) {
      const product = productById.get(productId);
      const quantity = quantitiesByProduct.get(productId);

      if (!product.store || product.store.status !== "approved") {
        return res.status(409).json({ success: false, message: `${product.name} is not currently available.` });
      }

      if (product.stock < quantity) {
        return res.status(409).json({
          success: false,
          message: product.stock > 0
            ? `Only ${product.stock} unit(s) of ${product.name} remain.`
            : `${product.name} is sold out.`,
        });
      }

      const lineTotal = product.price * quantity;
      const commissionRateBps = product.store.commissionRateBps ?? 1000;
      const commissionAmount = Math.round((lineTotal * commissionRateBps) / 10000);

      orderItems.push({
        product: product._id,
        store: product.store._id,
        seller: product.seller,
        storeName: product.store.name,
        storeSlug: product.store.slug,
        name: product.name,
        imageUrl: product.imageUrl,
        unitPrice: product.price,
        quantity,
        lineTotal,
        commissionRateBps,
        commissionAmount,
        sellerNet: lineTotal - commissionAmount,
      });
    }

    const subtotal = orderItems.reduce((total, item) => total + item.lineTotal, 0);
    const configuredDeliveryFee = Number(process.env.DELIVERY_FEE_NAIRA ?? 0);
    const deliveryFee = Number.isInteger(configuredDeliveryFee) && configuredDeliveryFee >= 0
      ? configuredDeliveryFee
      : 0;
    const shippingAddress = parseShippingAddress(req.body.shippingAddress);
    const reference = `fh_order_${crypto.randomUUID().replaceAll("-", "")}`;

    const order = await Order.create({
      customer: req.user._id,
      customerEmail: req.user.email,
      reference,
      items: orderItems,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      shippingAddress,
    });

    return res.status(201).json({
      success: true,
      message: "Order created. Continue to secure payment.",
      order: customerOrderView(order.toObject()),
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(400).json({ success: false, message: error.message || "Unable to create the order." });
  }
}

export async function listMyOrders(req, res) {
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({ success: true, orders: orders.map(customerOrderView) });
}

export async function listSellerOrders(req, res) {
  const orders = await Order.find({ "items.store": req.store._id, paymentStatus: "paid" })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({
    success: true,
    orders: orders.map((order) => sellerOrderView(order, req.store._id)),
  });
}

export async function updateSellerOrderStatus(req, res) {
  const { status } = req.body;
  if (!["processing", "shipped"].includes(status)) {
    return res.status(400).json({ success: false, message: "Sellers can mark orders as processing or shipped." });
  }

  if (!mongoose.isValidObjectId(req.params.orderId)) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  const order = await Order.findOne({ _id: req.params.orderId, "items.store": req.store._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });
  if (order.paymentStatus !== "paid") {
    return res.status(409).json({ success: false, message: "Wait for confirmed payment before fulfilling this order." });
  }
  if (order.inventoryStatus !== "committed") {
    return res.status(409).json({ success: false, message: "Inventory must be fully confirmed before this order can be fulfilled." });
  }

  const storeItems = order.items.filter((item) => sameId(item.store, req.store._id));
  if (storeItems.some((item) => ["delivered", "cancelled"].includes(item.fulfillmentStatus))) {
    return res.status(409).json({ success: false, message: "A completed or cancelled order cannot be changed by the seller." });
  }
  if (storeItems.some((item) => fulfillmentRank[status] < fulfillmentRank[item.fulfillmentStatus])) {
    return res.status(409).json({ success: false, message: "Order status cannot move backwards." });
  }

  storeItems.forEach((item) => {
    item.fulfillmentStatus = status;
  });
  updateAggregateFulfillment(order);
  await order.save();

  return res.json({
    success: true,
    message: status === "shipped" ? "Order marked as shipped." : "Order preparation started.",
    order: sellerOrderView(order.toObject(), req.store._id),
  });
}

export async function listAdminOrders(req, res) {
  const query = {};
  if (["pending", "paid", "failed", "refunded"].includes(req.query.paymentStatus)) {
    query.paymentStatus = req.query.paymentStatus;
  }
  if (["pending", "processing", "shipped", "delivered", "cancelled"].includes(req.query.fulfillmentStatus)) {
    query.fulfillmentStatus = req.query.fulfillmentStatus;
  }

  const orders = await Order.find(query)
    .populate("customer", "firstName lastName email phone")
    .populate("items.store", "name slug")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({ success: true, orders });
}

export async function updateAdminStoreOrderStatus(req, res) {
  const { status } = req.body;
  const { orderId, storeId } = req.params;

  if (!["processing", "shipped", "delivered", "cancelled"].includes(status)) {
    return res.status(400).json({ success: false, message: "Choose a valid fulfilment status." });
  }
  if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(storeId)) {
    return res.status(404).json({ success: false, message: "Order or store not found." });
  }

  const order = await Order.findOne({ _id: orderId, "items.store": storeId });
  if (!order) return res.status(404).json({ success: false, message: "Order not found for this store." });
  if (status === "delivered" && order.paymentStatus !== "paid") {
    return res.status(409).json({ success: false, message: "An unpaid order cannot be confirmed as delivered." });
  }
  if (status === "delivered" && order.inventoryStatus !== "committed") {
    return res.status(409).json({ success: false, message: "Inventory must be confirmed before delivery can release seller earnings." });
  }
  if (status === "cancelled" && order.paymentStatus === "paid") {
    return res.status(409).json({ success: false, message: "Paid orders need a reviewed refund workflow and cannot be cancelled here." });
  }

  const storeItems = order.items.filter((item) => sameId(item.store, storeId));
  if (storeItems.some((item) => item.fulfillmentStatus === "delivered") && status !== "delivered") {
    return res.status(409).json({ success: false, message: "Delivered items cannot be moved back to an earlier status." });
  }

  const now = new Date();
  storeItems.forEach((item) => {
    item.fulfillmentStatus = status;
    item.deliveredAt = status === "delivered" ? now : null;
  });
  updateAggregateFulfillment(order);
  await order.save();

  let payout = null;
  if (status === "delivered") {
    payout = await createPayoutForDeliveredStore(order, storeId);
  }

  return res.json({
    success: true,
    message: status === "delivered"
      ? "Delivery confirmed. Seller earnings are now in the payout hold period."
      : `Store order marked as ${status}.`,
    order,
    payout,
  });
}
