import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import crypto from "crypto";
import gmailRoutes from "./routes/gmailRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";

import connectDatabase from "./config/db.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bankTransferRoutes from "./routes/bankTransferRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import { createRateLimiter } from "./middleware/rateLimitMiddleware.js";

import {
  handlePaystackWebhook,
} from "./controllers/paymentController.js";

import {
  startAutomatedPayouts,
} from "./services/payoutService.js";

import {
  getEmailServiceStatus,
  verifyEmailTransporter,
} from "./services/emailService.js";

dotenv.config();

const app = express();

app.disable("x-powered-by");
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(compression({ threshold: 1024 }));

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5180",
  "http://127.0.0.1:5180",

  "https://flexhub-ng.netlify.app",

  "https://flexhub-ng-phi.vercel.app",
  "https://flexhub-ng-flexhubng.vercel.app",
  "https://flexhub-ng-git-main-flexhubng.vercel.app",

  "https://flex-hub.com.ng",
  "https://www.flex-hub.com.ng",

  process.env.CLIENT_URL,
]
  .filter(Boolean)
  .map((origin) =>
    origin.replace(/\/+$/, "")
  );

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin =
    origin.replace(/\/+$/, "");

  return (
    allowedOrigins.includes(
      normalizedOrigin
    ) ||
    normalizedOrigin.endsWith(
      "--flexhub-ng.netlify.app"
    ) ||
    normalizedOrigin.endsWith(
      "-flexhubng.vercel.app"
    )
  );
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.error(
        "❌ Blocked CORS origin:",
        origin
      );

      return callback(
        new Error(
          `CORS blocked this origin: ${origin}`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
    ],

    optionsSuccessStatus: 204,
  })
);

app.post(
  "/api/payments/paystack/webhook",
  express.raw({
    type: "application/json",
  }),
  handlePaystackWebhook
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "FlexHub NG API is running.",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  const email = getEmailServiceStatus();
  const paystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());

  return res.status(200).json({
    success: true,
    status: email.configured && paystackConfigured ? "healthy" : "degraded",
    message: "FlexHub NG backend is online.",
    services: {
      database: "connected",
      email: email.configured ? email.mode : "not-configured",
      payments: paystackConfigured ? "configured" : "not-configured",
    },
    timestamp: new Date().toISOString(),
  });
});

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, scope: "auth", message: "Too many authentication attempts. Please wait and try again." });
const aiLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, scope: "ai", message: "AI request limit reached. Please wait a moment." });
const paymentLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30, scope: "payments", message: "Too many payment requests. Please wait and try again." });

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bank-transfers", paymentLimiter, bankTransferRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/whatsapp", whatsappRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(
    "❌ Unhandled API error:",
    error
  );

  const isCorsError =
    error.message?.includes("CORS");

  return res
    .status(isCorsError ? 403 : 500)
    .json({
      success: false,
      message: isCorsError
        ? "This website is not permitted to access the server."
        : "The server could not complete this request.",
      requestId: req.requestId,
    });
});

const PORT =
  process.env.PORT || 5000;

function validateProductionConfiguration() {
  const warnings = [];
  const clientUrl = process.env.CLIENT_URL?.trim();

  if (!process.env.JWT_SECRET?.trim() || process.env.JWT_SECRET === "replace-with-a-long-random-secret") {
    warnings.push("JWT_SECRET must be set to a long, unique production secret.");
  }

  if (!clientUrl) {
    warnings.push("CLIENT_URL is missing; Paystack callbacks will default to localhost.");
  } else if (process.env.NODE_ENV === "production" && !clientUrl.startsWith("https://")) {
    warnings.push("CLIENT_URL should use HTTPS in production.");
  }

  if (!process.env.PAYSTACK_SECRET_KEY?.trim()) {
    warnings.push("PAYSTACK_SECRET_KEY is missing; checkout payments are unavailable.");
  }

  for (const warning of warnings) {
    console.warn(`⚠️ Configuration: ${warning}`);
  }
}

async function startServer() {
  try {
    validateProductionConfiguration();
    await connectDatabase();

    console.log(
      "✅ Database connection established."
    );

    verifyEmailTransporter().catch(
      (error) => {
        console.error(
          "Email verification startup error:",
          error
        );
      }
    );

    startAutomatedPayouts();

    const server = app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `✅ Server running on port ${PORT}`
        );
      }
    );

    const shutdown = (signal) => {
      console.log(`\n${signal} received. Closing FlexHub NG safely...`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error(
      "❌ Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();
