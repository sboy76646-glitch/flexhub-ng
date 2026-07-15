import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { BrandLogo, BrandName } from "../components/brand/Brand";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sellerIntent = searchParams.get("intent") === "sell";
  const { register, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(event) {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const result = await register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    });

    if (result.success) {
      navigate(sellerIntent ? "/sell#apply" : "/");
    }
  }

  const passwordsMatch =
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <Layout>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_32rem)]" />

        <div className="relative w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-10">
          <div className="mb-10 text-center">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-3"
            >
              <BrandLogo markClassName="h-16 w-16" textClassName="inline-flex text-2xl" theme="light" />
            </Link>

            <h1 className="text-4xl font-black text-slate-950">
              Create Your Account
            </h1>

            <p className="mt-3 text-slate-600">
              {sellerIntent
                ? "Create your account, then tell us about your business."
                : <>Join <BrandName /> and start shopping smarter.</>}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                First Name
              </label>

              <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 transition focus-within:border-orange-500 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]">
                <User
                  size={19}
                  className="shrink-0 text-orange-600"
                />

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  autoComplete="given-name"
                  required
                  className="ml-3 w-full bg-transparent py-4 text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Last Name
              </label>

              <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 transition focus-within:border-orange-500 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]">
                <User
                  size={19}
                  className="shrink-0 text-orange-600"
                />

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  autoComplete="family-name"
                  required
                  className="ml-3 w-full bg-transparent py-4 text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 transition focus-within:border-orange-500 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]">
                <Mail
                  size={19}
                  className="shrink-0 text-orange-600"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="ml-3 w-full bg-transparent py-4 text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>

              <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 transition focus-within:border-orange-500 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]">
                <Phone
                  size={19}
                  className="shrink-0 text-orange-600"
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  autoComplete="tel"
                  required
                  className="ml-3 w-full bg-transparent py-4 text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 transition focus-within:border-orange-500 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]">
                <Lock
                  size={19}
                  className="shrink-0 text-orange-600"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="ml-3 w-full bg-transparent py-4 text-slate-900 outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="text-slate-500 hover:text-orange-600"
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>

              <div
                className={`flex items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)] ${
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? "border-red-500"
                    : passwordsMatch
                    ? "border-green-500"
                    : "border-slate-300 focus-within:border-orange-500"
                }`}
              >
                <Lock
                  size={19}
                  className="shrink-0 text-orange-600"
                />

                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="ml-3 w-full bg-transparent py-4 text-slate-900 outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm((current) => !current)
                  }
                  aria-label={
                    showConfirm ? "Hide password" : "Show password"
                  }
                  className="text-slate-500 hover:text-orange-600"
                >
                  {showConfirm ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="md:col-span-2 text-sm font-semibold text-red-400">
                  Passwords do not match.
                </p>
              )}

            {passwordsMatch && (
              <div className="md:col-span-2 flex items-center gap-2 text-sm font-semibold text-green-400">
                <CheckCircle2 size={18} />
                Passwords match.
              </div>
            )}

            <label className="md:col-span-2 flex items-start gap-3 text-sm leading-6 text-slate-600">
              <input
                type="checkbox"
                required
                className="mt-1 accent-orange-500"
              />

              <span>
                I agree to the{" "}
                <button
                  type="button"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Terms & Conditions
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={
                loading ||
                formData.password !== formData.confirmPassword
              }
              className="md:col-span-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
            >
              <UserPlus size={20} />
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-orange-500/15 bg-orange-500/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-orange-600"
              />

              <p className="text-sm leading-6 text-slate-600">
                Your account details are securely processed, and your
                password is protected before it is stored.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              Login
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

export default Register;
