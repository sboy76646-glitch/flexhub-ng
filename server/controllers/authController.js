import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import {
  sendPasswordResetOTP,
  sendVerificationOTP,
} from "../services/emailService.js";

const OTP_EXPIRATION_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const ACCOUNT_LOCK_MINUTES = 15;
const MAX_LOGIN_ATTEMPTS = 5;

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function createPasswordResetToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      userId,
      purpose: "password-reset",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
}

function createOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(otp) {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
}

function normalizePhoneNumber(phone) {
  const cleanedPhone = String(phone)
    .trim()
    .replace(/[\s()-]/g, "");

  if (cleanedPhone.startsWith("+234")) {
    return `0${cleanedPhone.slice(4)}`;
  }

  if (cleanedPhone.startsWith("234")) {
    return `0${cleanedPhone.slice(3)}`;
  }

  return cleanedPhone;
}

function formatUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin,
  };
}

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export async function registerUser(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = normalizePhoneNumber(phone);

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    }).select(
      "+password +emailVerificationOTP +emailVerificationExpires +lastOTPRequestAt"
    );

    if (existingUser?.isVerified) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "An account with this email already exists."
            : "An account with this phone number already exists.",
      });
    }

    if (
      existingUser &&
      existingUser.email !== normalizedEmail
    ) {
      return res.status(409).json({
        success: false,
        message: "An account with this phone number already exists.",
      });
    }

    const otp = createOTP();
    const otpExpires = new Date(
      Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000
    );

    let user;

    if (existingUser) {
      existingUser.firstName = firstName.trim();
      existingUser.lastName = lastName.trim();
      existingUser.phone = normalizedPhone;
      existingUser.password = await bcrypt.hash(password, 12);
      existingUser.emailVerificationOTP = hashOTP(otp);
      existingUser.emailVerificationExpires = otpExpires;
      existingUser.lastOTPRequestAt = new Date();

      user = await existingUser.save();
    } else {
      user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: await bcrypt.hash(password, 12),
        isVerified: false,
        emailVerificationOTP: hashOTP(otp),
        emailVerificationExpires: otpExpires,
        lastOTPRequestAt: new Date(),
      });
    }

    try {
      await sendVerificationOTP({
        email: user.email,
        firstName: user.firstName,
        otp,
      });
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      return res.status(503).json({
        success: false,
        message:
          "Your account was created, but the verification email could not be sent. Please request another OTP.",
        requiresVerification: true,
        email: user.email,
      });
    }

    return res.status(201).json({
      success: true,
      message: "A verification code has been sent to your email.",
      requiresVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with these details already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| VERIFY EMAIL
|--------------------------------------------------------------------------
*/

export async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+emailVerificationOTP +emailVerificationExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Your email is already verified.",
        token: createToken(user._id),
        user: formatUser(user),
      });
    }

    if (
      !user.emailVerificationOTP ||
      user.emailVerificationOTP !== hashOTP(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "The verification code is incorrect.",
      });
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The verification code has expired. Request a new code.",
      });
    }

    user.isVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationExpires = null;
    user.lastOTPRequestAt = null;
    user.lastLogin = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your email has been verified successfully.",
      token: createToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify your email.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| RESEND VERIFICATION OTP
|--------------------------------------------------------------------------
*/

export async function resendVerificationOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+emailVerificationOTP +emailVerificationExpires +lastOTPRequestAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified.",
      });
    }

    if (user.lastOTPRequestAt) {
      const elapsedSeconds =
        (Date.now() - user.lastOTPRequestAt.getTime()) / 1000;

      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        const remainingSeconds = Math.ceil(
          OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
        });
      }
    }

    const otp = createOTP();

    user.emailVerificationOTP = hashOTP(otp);
    user.emailVerificationExpires = new Date(
      Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000
    );
    user.lastOTPRequestAt = new Date();

    await user.save();

    await sendVerificationOTP({
      email: user.email,
      firstName: user.firstName,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    console.error("Resend verification OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send another verification code.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| LOGIN WITH EMAIL OR PHONE
|--------------------------------------------------------------------------
*/

export async function loginUser(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email or phone number and password are required.",
      });
    }

    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");

    const user = await User.findOne(
      isEmail
        ? { email: trimmedIdentifier.toLowerCase() }
        : { phone: normalizePhoneNumber(trimmedIdentifier) }
    ).select("+password +loginAttempts +lockUntil");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, phone number, or password.",
      });
    }

    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );

      return res.status(423).json({
        success: false,
        message: `Your account is temporarily locked. Try again in ${remainingMinutes} minute${
          remainingMinutes === 1 ? "" : "s"
        }.`,
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      const attempts = (user.loginAttempts || 0) + 1;

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        user.loginAttempts = 0;
        user.lockUntil = new Date(
          Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000
        );

        await user.save();

        return res.status(423).json({
          success: false,
          message:
            "Too many failed attempts. Your account has been locked for 15 minutes.",
        });
      }

      user.loginAttempts = attempts;
      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid email, phone number, or password.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: "Please verify your email before logging in.",
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token: createToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
*/

export async function forgotPassword(req, res) {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Enter your email address or phone number.",
      });
    }

    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");

    const user = await User.findOne(
      isEmail
        ? { email: trimmedIdentifier.toLowerCase() }
        : { phone: normalizePhoneNumber(trimmedIdentifier) }
    ).select(
      "+passwordResetOTP +passwordResetExpires +lastOTPRequestAt"
    );

    /*
     * Use a generic response so attackers cannot easily discover
     * whether an account exists.
     */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account matches those details, a reset code has been sent.",
      });
    }

    if (user.lastOTPRequestAt) {
      const elapsedSeconds =
        (Date.now() - user.lastOTPRequestAt.getTime()) / 1000;

      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        const remainingSeconds = Math.ceil(
          OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
        });
      }
    }

    const otp = createOTP();

    user.passwordResetOTP = hashOTP(otp);
    user.passwordResetExpires = new Date(
      Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000
    );
    user.lastOTPRequestAt = new Date();

    await user.save();

    await sendPasswordResetOTP({
      email: user.email,
      firstName: user.firstName,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "A password-reset code has been sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send a password-reset code.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| VERIFY PASSWORD-RESET OTP
|--------------------------------------------------------------------------
*/

export async function verifyResetOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and reset code are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordResetOTP +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The reset code is invalid or expired.",
      });
    }

    if (
      !user.passwordResetOTP ||
      user.passwordResetOTP !== hashOTP(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "The reset code is incorrect.",
      });
    }

    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The reset code has expired. Request a new code.",
      });
    }

    const resetToken = createPasswordResetToken(user._id);

    user.passwordResetOTP = null;
    user.passwordResetExpires = null;
    user.lastOTPRequestAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Reset code verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify the reset code.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

export async function resetPassword(req, res) {
  try {
    const { resetToken, password, confirmPassword } = req.body;

    if (!resetToken || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Complete all password-reset fields.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch {
      return res.status(401).json({
        success: false,
        message:
          "Your password-reset session has expired. Request another code.",
      });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid password-reset token.",
      });
    }

    const user = await User.findById(decoded.userId).select(
      "+password +refreshToken +loginAttempts +lockUntil"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.refreshToken = null;
    user.loginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Your password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password.",
    });
  }
} 