import nodemailer from "nodemailer";

let transporter;

function getEmailCredentials() {
  const emailUser =
    process.env.EMAIL_USER?.trim();

  const emailPassword =
    process.env.EMAIL_APP_PASSWORD
      ?.replace(/\s+/g, "")
      .trim();

  if (!emailUser || !emailPassword) {
    throw new Error(
      "EMAIL_USER and EMAIL_APP_PASSWORD must be configured."
    );
  }

  return {
    emailUser,
    emailPassword,
  };
}

function createTransporter() {
  if (transporter) {
    return transporter;
  }

  const {
    emailUser,
    emailPassword,
  } = getEmailCredentials();

  transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: emailUser,
      pass: emailPassword,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,

    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });

  return transporter;
}

export async function verifyEmailTransporter() {
  try {
    const emailTransporter =
      createTransporter();

    await emailTransporter.verify();

    console.log(
      "✅ FlexHub NG email transporter is ready."
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Email transporter verification failed:",
      {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      }
    );

    return false;
  }
}

async function sendOTPEmail({
  email,
  firstName,
  otp,
  subject,
  heading,
  message,
}) {
  const {
    emailUser,
  } = getEmailCredentials();

  const emailTransporter =
    createTransporter();

  try {
    const result =
      await emailTransporter.sendMail({
        from: `"FlexHub NG" <${emailUser}>`,
        to: email,
        subject,

        text: `
Hello ${firstName || "FlexHub user"},

${message}

Your FlexHub NG verification code is: ${otp}

This code expires in 10 minutes.

Do not share this code with anyone.

FlexHub NG
        `.trim(),

        html: `
          <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px;">
            <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 16px; padding: 32px;">
              <h1 style="color: #0f172a; margin-top: 0;">
                ${heading}
              </h1>

              <p style="color: #475569; font-size: 16px;">
                Hello ${firstName || "FlexHub user"},
              </p>

              <p style="color: #475569; font-size: 16px;">
                ${message}
              </p>

              <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <strong style="font-size: 32px; letter-spacing: 8px; color: #f97316;">
                  ${otp}
                </strong>
              </div>

              <p style="color: #64748b;">
                This code expires in 10 minutes.
              </p>

              <p style="color: #64748b;">
                Do not share this code with anyone.
              </p>

              <p style="color: #0f172a; font-weight: bold; margin-bottom: 0;">
                FlexHub NG
              </p>
            </div>
          </div>
        `,
      });

    console.log(
      `✅ OTP email sent to ${email}. Message ID: ${result.messageId}`
    );

    return result;
  } catch (error) {
    console.error("❌ OTP email failed:", {
      email,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    throw error;
  }
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