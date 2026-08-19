import { useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Send,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { BrandLogo } from "../components/brand/Brand";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const navigate = useNavigate();

  const {
    forgotPassword,
    loading,
  } = useAuth();

  const [identifier, setIdentifier] =
    useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const result = await forgotPassword(
      identifier.trim()
    );

    if (!result.success) {
      return;
    }

    const verificationEmail =
      result.email ||
      (identifier.includes("@")
        ? identifier.trim()
        : "");

    navigate(
      `/verify-reset-otp?email=${encodeURIComponent(
        verificationEmail
      )}`,
      {
        state: {
          email: verificationEmail,
        },
      }
    );
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
              <KeyRound size={30} />
            </div>

            <h1 className="mt-5 text-3xl font-black text-white">
              Forgot Password?
            </h1>

            <p className="mt-3 leading-6 text-slate-400">
              Enter the email address or phone number
              connected to your FlexHub NG account.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="reset-identifier"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Email Address or Phone Number
              </label>

              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800 px-4 transition focus-within:border-orange-500 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]">
                <Mail
                  size={19}
                  className="shrink-0 text-orange-400"
                />

                <input
                  id="reset-identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) =>
                    setIdentifier(event.target.value)
                  }
                  placeholder="Email address or phone number"
                  autoComplete="username"
                  required
                  className="ml-3 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading || !identifier.trim()
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
            >
              <Send size={20} />

              {loading
                ? "Sending code..."
                : "Send Reset Code"}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300"
          >
            <ArrowLeft size={17} />
            Back to login
          </Link>
        </div>
      </section>
    </Layout>
  );
}

export default ForgotPassword; 