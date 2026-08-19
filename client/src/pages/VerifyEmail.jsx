import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout";
import { BrandLogo } from "../components/brand/Brand";
import { useAuth } from "../context/AuthContext";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    verifyEmail,
    resendVerificationOTP,
    loading,
  } = useAuth();

  const [email, setEmail] = useState(
    searchParams.get("email") || ""
  );

  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  function handleOTPChange(event) {
    const numericValue = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(numericValue);
  }

  async function handleVerify(event) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Enter the complete 6-digit verification code.");
      return;
    }

    const result = await verifyEmail({
      email: email.trim(),
      otp,
    });

    if (result.success) {
      navigate("/", {
        replace: true,
      });
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }

    if (cooldown > 0 || resending) {
      return;
    }

    setResending(true);

    const result = await resendVerificationOTP(
      email.trim()
    );

    if (result.success) {
      setCooldown(60);
      setOtp("");
    }

    setResending(false);
  }

  return (
    <Layout>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_30rem)]" />

        <div className="relative w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur sm:p-10">
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="mb-6 inline-flex"
            >
              <BrandLogo
                markClassName="h-16 w-16"
                textClassName="inline-flex text-2xl"
              />
            </Link>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <MailCheck size={31} />
            </div>

            <h1 className="mt-5 text-3xl font-black text-white">
              Verify Your Email
            </h1>

            <p className="mt-3 leading-6 text-slate-400">
              Enter the six-digit verification code sent to your
              email address.
            </p>
          </div>

          <form
            onSubmit={handleVerify}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="verification-email"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Email Address
              </label>

              <input
                id="verification-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="verification-code"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Verification Code
              </label>

              <input
                id="verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={handleOTPChange}
                placeholder="000000"
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 text-center text-3xl font-black tracking-[0.4em] text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
              />

              <p className="mt-2 text-center text-xs text-slate-500">
                The code expires after 10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
            >
              {loading
                ? "Verifying..."
                : "Verify Email"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={
              resending ||
              cooldown > 0 ||
              !email.trim()
            }
            className="mt-5 w-full text-sm font-semibold text-orange-400 transition hover:text-orange-300 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {resending
              ? "Sending new code..."
              : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend verification code"}
          </button>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already verified?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              Go to login
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

export default VerifyEmail; 