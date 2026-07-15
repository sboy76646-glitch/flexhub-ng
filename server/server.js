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
import { handlePaystackWebhook } from "./controllers/paymentController.js";
import { startAutomatedPayouts } from "./services/payoutService.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://flexhub-ng.netlify.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an origin, such as Postman or direct API tests
      if (!origin) {
        return callback(null, true);
      }

      // Allow the main Netlify site and Netlify deploy-preview domains
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith("--flexhub-ng.netlify.app");

      if (isAllowed) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(
        new Error(`CORS blocked this origin: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.post(
  "/api/payments/paystack/webhook",
  express.raw({ type: "application/json" }),
  handlePaystackWebhook
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FlexHub NG API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payouts", payoutRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error("Unhandled API error:", error);
  return res.status(500).json({ success: false, message: "The server could not complete this request." });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();
  startAutomatedPayouts();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

startServer();
