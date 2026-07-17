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
export async function sendPasswordChangedEmail({
  email,
  firstName,
}) {
  const resend = getResendClient();

  const recipientName =
    firstName?.trim() || "FlexHub user";

  const { data, error } = await resend.emails.send({
    from: getSenderAddress(),
    to: [email],
    subject: "Security alert: Your FlexHub NG password was changed",

    text: `
Hello ${recipientName},

Your FlexHub NG account password was changed successfully.

If you made this change, no further action is required.

If you did not make this change, contact FlexHub NG support immediately and secure your email account.

FlexHub NG
https://www.flex-hub.com.ng
    `.trim(),

    html: `
      <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
        <div style="padding:32px 16px;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">

            <div style="background:#0f172a;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;">
                FlexHub NG
              </h1>

              <p style="margin:8px 0 0;color:#cbd5e1;font-size:14px;">
                Account Security Notification
              </p>
            </div>

            <div style="padding:32px;">
              <h2 style="margin:0 0 20px;color:#0f172a;font-size:24px;">
                Your password was changed
              </h2>

              <p style="color:#475569;font-size:16px;line-height:1.6;">
                Hello ${recipientName},
              </p>

              <p style="color:#475569;font-size:16px;line-height:1.6;">
                The password for your FlexHub NG account was changed successfully.
              </p>

              <div style="margin:24px 0;padding:18px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;">
                <p style="margin:0;color:#065f46;font-size:15px;font-weight:bold;">
                  If you made this change
                </p>

                <p style="margin:8px 0 0;color:#047857;font-size:14px;line-height:1.5;">
                  No further action is required. You can continue using your new password.
                </p>
              </div>

              <div style="margin:24px 0;padding:18px;background:#fff7ed;border:1px solid #fdba74;border-radius:12px;">
                <p style="margin:0;color:#9a3412;font-size:15px;font-weight:bold;">
                  Did not make this change?
                </p>

                <p style="margin:8px 0 0;color:#7c2d12;font-size:14px;line-height:1.5;">
                  Secure your email account and contact FlexHub NG support immediately.
                </p>
              </div>

              <p style="color:#64748b;font-size:14px;line-height:1.6;">
                For your security, FlexHub NG will never ask you to send your password or verification code by email.
              </p>
            </div>

            <div style="background:#f1f5f9;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:13px;">
                This is an automated security message from FlexHub NG.
              </p>

              <p style="margin:8px 0 0;">
                <a
                  href="https://www.flex-hub.com.ng"
                  style="color:#f97316;text-decoration:none;font-weight:bold;"
                >
                  Visit FlexHub NG
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error(
      "❌ Password-change security email error:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to send password-change security email."
    );
  }

  console.log(
    `✅ Password-change security email sent to ${email}. ID: ${data?.id}`
  );

  return data;
} 