import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";

import {
  handlePaystackWebhook,
} from "./controllers/paymentController.js";

import {
  startAutomatedPayouts,
} from "./services/payoutService.js";

import {
  verifyEmailTransporter,
} from "./services/emailService.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",

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
  return res.status(200).json({
    success: true,
    status: "healthy",
    message:
      "FlexHub NG backend is online.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payouts", payoutRoutes);

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
    });
});

const PORT =
  process.env.PORT || 5000;

async function startServer() {
  try {
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

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `✅ Server running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();