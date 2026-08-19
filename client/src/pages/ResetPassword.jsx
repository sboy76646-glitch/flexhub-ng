import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import { BrandLogo } from "../components/brand/Brand";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const { resetPassword, loading } =
    useAuth();

  const resetToken =
    location.state?.resetToken ||
    sessionStorage.getItem(
      "flexhub-reset-token"
    ) ||
    "";

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [formData, setFormData] =
    useState({
      password: "",
      confirmPassword: "",
    });

  if (!resetToken) {
    return (
      <Navigate
        to="/forgot-password"
        replace
      />
    );
  }

  function handleChange(event) {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]:
        event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formData.password.length < 8) {
      toast.error(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      toast.error(
        "Passwords do not match."
      );

      return;
    }

    const result = await resetPassword({
      resetToken,
      password: formData.password,
      confirmPassword:
        formData.confirmPassword,
    });

    if (!result.success) {
      return;
    }

    sessionStorage.removeItem(
      "flexhub-reset-token"
    );

    sessionStorage.removeItem(
      "flexhub-reset-email"
    );

    navigate("/login", {
      replace: true,
    });
  }

  const passwordsMatch =
    Boolean(formData.confirmPassword) &&
    formData.password ===
      formData.confirmPassword;

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
              Create New Password
            </h1>

            <p className="mt-3 leading-6 text-slate-400">
              Choose a strong password that you have
              not used for this account before.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                New Password
              </label>

              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800 px-4 transition focus-within:border-orange-500">
                <Lock
                  size={19}
                  className="shrink-0 text-orange-400"
                />

                <input
                  id="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="ml-3 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="text-slate-400 hover:text-orange-400"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-new-password"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Confirm New Password
              </label>

              <div
                className={`flex items-center rounded-2xl border bg-slate-800 px-4 transition ${
                  formData.confirmPassword &&
                  !passwordsMatch
                    ? "border-red-500"
                    : passwordsMatch
                      ? "border-green-500"
                      : "border-slate-700 focus-within:border-orange-500"
                }`}
              >
                <Lock
                  size={19}
                  className="shrink-0 text-orange-400"
                />

                <input
                  id="confirm-new-password"
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="ml-3 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showConfirm
                      ? "Hide password"
                      : "Show password"
                  }
                  className="text-slate-400 hover:text-orange-400"
                >
                  {showConfirm ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {passwordsMatch && (
              <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                <CheckCircle2 size={18} />
                Passwords match.
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !passwordsMatch ||
                formData.password.length < 8
              }
              className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
            >
              {loading
                ? "Resetting password..."
                : "Reset Password"}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}

export default ResetPassword; 