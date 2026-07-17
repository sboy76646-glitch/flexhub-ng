import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  return new Resend(apiKey);
}

function getSenderAddress() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "FlexHub NG <onboarding@resend.dev>"
  );
}

async function sendOTPEmail({
  email,
  firstName,
  otp,
  subject,
  heading,
  message,
}) {
  const resend = getResendClient();

  const recipientName =
    firstName?.trim() || "FlexHub user";

  const { data, error } =
    await resend.emails.send({
      from: getSenderAddress(),
      to: [email],
      subject,

      text: `
Hello ${recipientName},

${message}

Your FlexHub NG verification code is: ${otp}

This code expires in 10 minutes.

Do not share this code with anyone.

FlexHub NG
      `.trim(),

      html: `
        <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px;">
          <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:16px;padding:32px;">
            <h1 style="color:#0f172a;margin-top:0;">
              ${heading}
            </h1>

            <p style="color:#475569;font-size:16px;">
              Hello ${recipientName},
            </p>

            <p style="color:#475569;font-size:16px;">
              ${message}
            </p>

            <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
              <strong style="font-size:32px;letter-spacing:8px;color:#f97316;">
                ${otp}
              </strong>
            </div>

            <p style="color:#64748b;">
              This code expires in 10 minutes.
            </p>

            <p style="color:#64748b;">
              Do not share this code with anyone.
            </p>

            <p style="color:#0f172a;font-weight:bold;margin-bottom:0;">
              FlexHub NG
            </p>
          </div>
        </div>
      `,
    });

  if (error) {
    console.error(
      "❌ Resend email error:",
      error
    );

    throw new Error(
      error.message ||
        "The email provider rejected the message."
    );
  }

  console.log(
    `✅ OTP email sent to ${email}. ID: ${data?.id}`
  );

  return data;
}

export async function verifyEmailTransporter() {
  if (!process.env.RESEND_API_KEY) {
    console.error(
      "❌ RESEND_API_KEY is missing."
    );

    return false;
  }

  console.log(
    "✅ Resend email service is configured."
  );

  return true;
}

export async function sendVerificationOTP({
  email,
  firstName,
  otp,
}) {
  return sendOTPEmail({
    email,
    firstName,
    otp,
    subject:
      "Verify your FlexHub NG account",
    heading: "Verify your email",
    message:
      "Use the verification code below to complete your FlexHub NG registration.",
  });
}

export async function sendPasswordResetOTP({
  email,
  firstName,
  otp,
}) {
  return sendOTPEmail({
    email,
    firstName,
    otp,
    subject:
      "Reset your FlexHub NG password",
    heading: "Reset your password",
    message:
      "Use the code below to verify your password-reset request. If you did not request this, you can ignore this email.",
  });
}