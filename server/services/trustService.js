const levelAliases = {
  bronze: "basic",
  silver: "verified",
  gold: "premium",
  platinum: "premium",
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

export function calculateTrustScore(store, verifiedProductRate = 0) {
  const checks = store?.verificationChecks || {};
  const performance = store?.performance || {};
  const completedOrders = Number(performance.completedOrders || 0);
  const reviewCount = Number(performance.verifiedReviewCount || 0);

  const verificationPoints =
    (checks.identity ? 15 : 0) +
    (checks.address ? 10 : 0) +
    (checks.business ? 5 : 0);

  const deliveryPoints = completedOrders > 0
    ? (clamp(performance.onTimeDeliveryRate, 0, 100) * 0.2) + Math.min(5, completedOrders / 10)
    : 0;

  const returnPoints = completedOrders > 0
    ? (100 - clamp(performance.returnRate, 0, 100)) * 0.1
    : 0;

  const responseMinutes = performance.averageResponseMinutes;
  const responsePoints = responseMinutes == null
    ? 0
    : responseMinutes <= 15
      ? 10
      : responseMinutes <= 60
        ? 7
        : responseMinutes <= 240
          ? 4
          : 1;

  const productPoints = clamp(verifiedProductRate, 0, 100) * 0.15;
  const ratingPoints = reviewCount > 0
    ? (clamp(performance.averageRating, 0, 5) / 5) * 10
    : 0;

  return Math.round(
    verificationPoints +
    deliveryPoints +
    returnPoints +
    responsePoints +
    productPoints +
    ratingPoints
  );
}

export function getSellerTier(store, trustScore) {
  const checks = store?.verificationChecks || {};
  const completedOrders = Number(store?.performance?.completedOrders || 0);
  const savedLevel = levelAliases[store?.verificationLevel] || store?.verificationLevel;

  if (
    savedLevel === "premium" ||
    (checks.identity && checks.address && checks.business && trustScore >= 85 && completedOrders >= 50)
  ) {
    return { id: "premium", label: "Premium Verified Seller" };
  }

  if (savedLevel === "verified" || (checks.identity && checks.address)) {
    return { id: "verified", label: "Verified Seller" };
  }

  return { id: "basic", label: "Basic Seller" };
}

export function buildSellerTrust(store, verifiedProductRate = 0) {
  const trustScore = calculateTrustScore(store, verifiedProductRate);

  return {
    score: trustScore,
    tier: getSellerTier(store, trustScore),
    identityVerified: Boolean(store?.verificationChecks?.identity),
    addressChecked: Boolean(store?.verificationChecks?.address),
    businessVerified: Boolean(store?.verificationChecks?.business),
    completedOrders: Number(store?.performance?.completedOrders || 0),
    onTimeDeliveryRate: Number(store?.performance?.onTimeDeliveryRate || 0),
    returnRate: Number(store?.performance?.returnRate || 0),
    averageResponseMinutes: store?.performance?.averageResponseMinutes ?? null,
    averageRating: Number(store?.performance?.averageRating || 0),
    verifiedReviewCount: Number(store?.performance?.verifiedReviewCount || 0),
    productMatchRate: Number(store?.performance?.productMatchRate || 0),
    verifiedProductRate: Math.round(clamp(verifiedProductRate, 0, 100)),
  };
}
