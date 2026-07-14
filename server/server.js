import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allows tools such as Postman and requests without an Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
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