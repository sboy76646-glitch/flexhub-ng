import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://flexhub-ng.netlify.app",
];

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

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FlexHub NG API is running.",
  });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

startServer(); 