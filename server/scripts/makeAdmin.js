import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";

dotenv.config();

const email = String(process.argv[2] || "").trim().toLowerCase();

if (!email || !email.includes("@")) {
  console.error("Usage: npm run make-admin -- you@example.com");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing from server/.env");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  ).select("firstName lastName email role");

  if (!user) {
    console.error(`No FlexHub NG account exists for ${email}. Register it first.`);
    process.exitCode = 1;
  } else {
    console.log(`${user.firstName} ${user.lastName} (${user.email}) is now an admin.`);
  }
} catch (error) {
  console.error(`Unable to update the account: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
