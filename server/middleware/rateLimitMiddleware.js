const buckets = new Map();

function getClientKey(req, scope) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : String(forwarded || req.ip || "unknown").split(",")[0].trim();
  return `${scope}:${ip}`;
}

export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests. Please try again later.",
  scope = "global",
} = {}) {
  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = getClientKey(req, scope);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", Math.max(max - 1, 0));
      res.setHeader("RateLimit-Reset", Math.ceil((now + windowMs) / 1000));
      return next();
    }

    current.count += 1;
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(max - current.count, 0));
    res.setHeader("RateLimit-Reset", Math.ceil(current.resetAt / 1000));

    if (current.count > max) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({ success: false, message });
    }

    return next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref();
