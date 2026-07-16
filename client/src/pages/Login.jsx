import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Layout from "../components/layout/Layout";
import { BrandLogo } from "../components/brand/Brand";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, loading } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  function handleChange(event) {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const result = await login(
      formData.identifier.trim(),
      formData.password,
      rememberMe
    );

    if (result.requiresVerification) {
      navigate(
        `/verify-email?email=${encodeURIComponent(
          result.email || ""
        )}`
      );

      return;
    }

    if (result.success) {
      const destination =
        typeof location.state?.from === "string"
          ? location.state.from
          : location.state?.from?.pathname || "/";

      navigate(destination, {
        replace: true,
      });
    }
  }

  return (
    <Layout>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_30rem)]" />

        <div className="relative w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur sm:p-10">
          <div className="mb-10 text-center">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-3"
            >
              <BrandLogo
                markClassName="h-16 w-16"
                textClassName="inline-flex text-2xl"
              />
            </Link>

            <h1 className="text-4xl font-black text-white">
              Welcome Back
            </h1>

            <p className="mt-3 text-slate-400">
              Sign in with your email address or phone number.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="login-identifier"
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
                  id="login-identifier"
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Email address or phone number"
                  autoComplete="username"
                  required
                  className="ml-3 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Password
              </label>

              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800 px-4 transition focus-within:border-orange-500 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]">
                <Lock
                  size={19}
                  className="shrink-0 text-orange-400"
                />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                  className="text-slate-400 transition hover:text-orange-400"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="remember-me"
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-400"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="h-4 w-4 accent-orange-500"
                />

                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
            >
              <LogIn size={20} />

              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-orange-500/15 bg-orange-500/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-orange-400"
              />

              <p className="text-sm leading-6 text-slate-400">
                Your login details are securely processed and your
                password is never stored in plain text.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              Register
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

export default Login; 