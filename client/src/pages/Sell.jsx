import { BadgeCheck, BarChart3, PackagePlus, Store } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { BrandName } from "../components/brand/Brand";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function Sell() {
  const { isAuthenticated, token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", location: "", description: "" });

  const apiBaseUrl = import.meta.env.PROD
    ? "https://flexhub-ng.onrender.com"
    : import.meta.env.VITE_API_URL || "http://localhost:5000";

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/stores/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to submit application.");
      setSubmitted(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof TypeError ? "Unable to reach the server. Please try again." : error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    [Store, "Create your seller account", "Tell us about your business and the products you plan to sell."],
    [BadgeCheck, "Complete verification", "We review seller details before a mini-store becomes public."],
    [PackagePlus, "Add products", "Use clear photos, honest descriptions, pricing and delivery information."],
    [BarChart3, "Manage your business", "Track products and orders from one seller workspace as the platform grows."],
  ];

  return (
    <Layout>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="flex flex-wrap items-center gap-1 text-sm font-bold uppercase tracking-[0.22em] text-orange-600"><span>Sell on</span> <BrandName /></p>
            <h1 className="mt-5 text-5xl font-black leading-tight text-slate-950 sm:text-6xl">
              Give your business a store customers can actually find.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Create a focused mini-store, list your products and reach shoppers across Nigeria from one marketplace.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to={isAuthenticated ? "/sell#apply" : "/register?intent=sell"}
                className="rounded-xl bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600"
              >
                {isAuthenticated ? "Continue seller setup" : "Create seller account"}
              </Link>
              <Link to="/stores" className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-900 transition hover:border-orange-500 hover:text-orange-600">
                See existing stores
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">Seller applications are reviewed before a store goes live.</p>
          </div>

          <div className="space-y-4">
            {steps.map(([Icon, title, body], index) => (
              <div key={title} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                  <Icon size={23} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Step {index + 1}</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
                  <p className="mt-2 leading-7 text-slate-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="border-t border-slate-200 bg-white py-16" id="apply">
          <div className="mx-auto max-w-3xl px-6">
            {submitted ? (
              <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-10 text-center">
                <BadgeCheck className="mx-auto text-green-400" size={44} />
                <h2 className="mt-5 text-3xl font-black text-slate-950">Application received</h2>
                <p className="mt-3 leading-7 text-slate-600">Your store details are now ready for review. The mini-store will only become public after approval.</p>
                <Link to="/seller/dashboard" className="mt-7 inline-flex rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600">
                  Add your first product draft
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-600">Seller application</p>
                <h2 className="mt-3 text-4xl font-black text-slate-950">Tell us about your business</h2>
                <p className="mt-4 text-slate-600">Use a real business name and a clear description. You can refine branding and products after approval.</p>
                <form onSubmit={handleSubmit} className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-2 sm:p-8">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Store name
                    <input name="name" value={form.name} onChange={handleChange} required maxLength={80} placeholder="e.g. Amaka Home Essentials" className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Main category
                    <input name="category" value={form.category} onChange={handleChange} required maxLength={60} placeholder="e.g. Home & kitchen" className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Business location
                    <input name="location" value={form.location} onChange={handleChange} required maxLength={80} placeholder="City, State" className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                    What do you sell?
                    <textarea name="description" value={form.description} onChange={handleChange} required maxLength={500} rows={5} placeholder="Describe your products, customers and what makes your store reliable." className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500" />
                  </label>
                  <button disabled={submitting} className="rounded-xl bg-orange-500 px-6 py-4 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 sm:col-span-2">
                    {submitting ? "Submitting…" : "Submit for review"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}

export default Sell;
