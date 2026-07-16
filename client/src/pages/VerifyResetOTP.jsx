import {
  useEffect,
  useState,
} from "react";
import {
  KeyRound,
  MailCheck,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";

import { BrandLogo } from "../components/brand/Brand";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function VerifyResetOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] =
    useSearchParams();

  const {
    verifyResetOTP,
    forgotPassword,
    loading,
  } = useAuth();

  const initialEmail =
    location.state?.email ||
    searchParams.get("email") ||
    "";

  const [email, setEmail] =
    useState(initialEmail);

  const [otp, setOtp] =
    useState("");

  const [resending, setResending] =
    useState(false);

  const [cooldown, setCooldown] =
    useState(60);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCooldown((current) =>
        Math.max(current - 1, 0)
      );
    }, 1000);

    return () =>
      window.clearInterval(timer);
  }, [cooldown]);

  function handleOTPChange(event) {
    const numericValue =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(numericValue);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error(
        "Enter the email address that received the code."
      );

      return;
    }

    if (otp.length !== 6) {
      toast.error(
        "Enter the complete 6-digit reset code."
      );

      return;
    }

    const result = await verifyResetOTP({
      email: email.trim(),
      otp,
    });

    if (!result.success) {
      return;
    }

    sessionStorage.setItem(
      "flexhub-reset-token",
      result.resetToken
    );

    sessionStorage.setItem(
      "flexhub-reset-email",
      email.trim()
    );

    navigate("/reset-password", {
      replace: true,
      state: {
        resetToken: result.resetToken,
        email: email.trim(),
      },
    });
  }

  async function handleResend() {
    if (
      !email.trim() ||
      resending ||
      cooldown > 0
    ) {
      return;
    }

    setResending(true);

    const result = await forgotPassword(
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
              <MailCheck size={30} />
            </div>

            <h1 className="mt-5 text-3xl font-black text-white">
              Enter Reset Code
            </h1>

            <p className="mt-3 leading-6 text-slate-400">
              Enter the six-digit code sent to
              your registered email address.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Email Address
              </label>

              <input
                id="reset-email"
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
                htmlFor="reset-code"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Six-Digit Reset Code
              </label>

              <input
                id="reset-code"
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
              disabled={
                loading ||
                otp.length !== 6 ||
                !email.trim()
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
            >
              <KeyRound size={20} />

              {loading
                ? "Verifying code..."
                : "Verify Reset Code"}
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
            className="mt-5 w-full text-sm font-semibold text-orange-400 hover:text-orange-300 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {resending
              ? "Sending new code..."
              : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend reset code"}
          </button>

          <p className="mt-8 text-center text-sm text-slate-400">
            Entered the wrong account?{" "}
            <Link
              to="/forgot-password"
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              Start again
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

export default VerifyResetOTP; 