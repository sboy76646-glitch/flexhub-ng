import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
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
      navigate("/");
    }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-10">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white">
              Create Your Account
            </h1>

            <p className="text-gray-400 mt-3">
              Join FlexHub NG and start shopping smarter.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-6"
          >
            <div>
              <label className="text-gray-300 mb-2 block">
                First Name
              </label>

              <div className="flex items-center bg-slate-800 rounded-xl px-4">
                <User size={18} className="text-gray-400" />

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  className="bg-transparent text-white outline-none w-full py-4 ml-3"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 mb-2 block">
                Last Name
              </label>

              <div className="flex items-center bg-slate-800 rounded-xl px-4">
                <User size={18} className="text-gray-400" />

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  className="bg-transparent text-white outline-none w-full py-4 ml-3"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-300 mb-2 block">
                Email Address
              </label>

              <div className="flex items-center bg-slate-800 rounded-xl px-4">
                <Mail size={18} className="text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="bg-transparent text-white outline-none w-full py-4 ml-3"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-300 mb-2 block">
                Phone Number
              </label>

              <div className="flex items-center bg-slate-800 rounded-xl px-4">
                <Phone size={18} className="text-gray-400" />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
                  className="bg-transparent text-white outline-none w-full py-4 ml-3"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 mb-2 block">
                Password
              </label>

              <div className="flex items-center bg-slate-800 rounded-xl px-4">
                <Lock size={18} className="text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  minLength={6}
                  required
                  className="bg-transparent text-white outline-none w-full py-4 ml-3"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
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

            <div>
              <label className="text-gray-300 mb-2 block">
                Confirm Password
              </label>

              <div className="flex items-center bg-slate-800 rounded-xl px-4">
                <Lock size={18} className="text-gray-400" />

                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  minLength={6}
                  required
                  className="bg-transparent text-white outline-none w-full py-4 ml-3"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm((current) => !current)
                  }
                >
                  {showConfirm ? (
                    <EyeOff className="text-gray-400" />
                  ) : (
                    <Eye className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="md:col-span-2 text-red-400">
                  Passwords do not match.
                </p>
              )}

            <label className="md:col-span-2 flex items-start gap-3 text-gray-400">
              <input type="checkbox" required className="mt-1" />

              <span>
                I agree to the Terms & Conditions and Privacy Policy.
              </span>
            </label>

            <button
              type="submit"
              disabled={
                loading ||
                formData.password !== formData.confirmPassword
              }
              className="md:col-span-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed py-4 rounded-xl text-lg font-bold text-white transition"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
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