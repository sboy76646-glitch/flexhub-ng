import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
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

    if (!formData.email.trim() || !formData.password) {
      return;
    }

    const result = await login(
      formData.email.trim(),
      formData.password
    );

    if (result.success) {
      navigate("/");
    }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl p-10 border border-slate-800">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white">
              Welcome Back
            </h1>

            <p className="text-gray-400 mt-3">
              Sign in to continue shopping on FlexHub NG
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-300 mb-2">
                Email Address
              </label>

              <div className="flex items-center bg-slate-800 rounded-xl px-4">
                <Mail
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="bg-transparent text-white outline-none w-full py-4 ml-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Password
              </label>

              <div className="flex items-center bg-slate-800 rounded-xl px-4">
                <Lock
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="bg-transparent text-white outline-none w-full py-4 ml-3"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="text-gray-400" />
                  ) : (
                    <Eye className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-gray-400">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed py-4 rounded-xl text-white text-lg font-bold transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
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