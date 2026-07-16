import {
  BadgeCheck,
  BarChart3,
  PackagePlus,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, apiRequest } from "../lib/api";

function Sell() {
  const { isAuthenticated, token, updateUser, user } = useAuth();

  const [existingStore, setExistingStore] = useState(null);
  const [checkingStore, setCheckingStore] = useState(
    Boolean(isAuthenticated)
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
  });

  const storeWasRejected = existingStore?.status === "rejected";

  const hasSellerAccount =
    !storeWasRejected &&
    (Boolean(existingStore) ||
      ["seller_pending", "seller"].includes(user?.role));

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setExistingStore(null);
      setCheckingStore(false);
      return undefined;
    }

    const controller = new AbortController();

    setCheckingStore(true);

    fetch(`${API_BASE_URL}/api/stores/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to check seller status."
          );
        }

        return data.store || null;
      })
      .then((store) => {
        if (controller.signal.aborted) return;

        setExistingStore(store);

        if (store?.status === "rejected") {
          setForm({
            name: store.name || "",
            category: store.category || "",
            location: store.location || "",
            description: store.description || "",
          });
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          toast.error(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCheckingStore(false);
        }
      });

    return () => controller.abort();
  }, [isAuthenticated, token]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated || !token) {
      toast.error("Please log in before applying to become a seller.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await apiRequest("/api/stores/apply", {
        method: "POST",
        token,
        body: JSON.stringify(form),
      });

      setSubmitted(true);
      setExistingStore(
        data.store || {
          status: "pending",
          name: form.name,
        }
      );

      updateUser({
        role: "seller_pending",
      });

      toast.success(data.message);
    } catch (error) {
      toast.error(
        error instanceof TypeError
          ? "Unable to reach the server. Please try again."
          : error.message
      );
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    [
      Store,
      "Create your seller account",
      "Tell us about your business and the products you plan to sell.",
    ],
    [
      BadgeCheck,
      "Complete verification",
      "We review seller details before a mini-store becomes public.",
    ],
    [
      PackagePlus,
      "Add products",
      "Use clear photos, honest descriptions, pricing and delivery information.",
    ],
    [
      BarChart3,
      "Manage your business",
      "Track products and orders from one seller workspace as the platform grows.",
    ],
  ];

  return (
    <Layout>
      <section className="bg-slate-950 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">
              Sell on FlexHub NG
            </p>

            <h1 className="mt-5 text-5xl font-black leading-tight text-white sm:text-6xl">
              Give your business a store customers can actually find.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Create a focused mini-store, list your products and reach
              shoppers across Nigeria from one marketplace.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to={
                  isAuthenticated
                    ? hasSellerAccount
                      ? "/seller"
                      : "/sell#apply"
                    : "/register?intent=sell"
                }
                className="rounded-xl bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600"
              >
                {checkingStore
                  ? "Checking seller status…"
                  : hasSellerAccount
                    ? "Open seller workspace"
                    : storeWasRejected
                      ? "Correct and resubmit"
                      : isAuthenticated
                        ? "Start seller application"
                        : "Create seller account"}
              </Link>

              <Link
                to="/stores"
                className="rounded-xl border border-slate-700 px-6 py-4 font-bold text-white transition hover:border-orange-500 hover:text-orange-400"
              >
                See existing stores
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Seller applications are reviewed before a store goes live.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map(([Icon, title, body], index) => (
              <div
                key={title}
                className="flex gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                  <Icon size={23} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Step {index + 1}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    {title}
                  </h2>

                  <p className="mt-2 leading-7 text-slate-400">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isAuthenticated && !checkingStore && (
        <section
          className="border-t border-slate-200 bg-slate-50 py-16 text-slate-900"
          id="apply"
        >
          <div className="mx-auto max-w-3xl px-6">
            {hasSellerAccount ? (
              <div className="rounded-3xl border border-orange-200 bg-white p-10 text-center shadow-sm">
                <Store
                  className="mx-auto text-orange-500"
                  size={44}
                />

                <h2 className="mt-5 text-3xl font-black text-slate-950">
                  Your seller workspace is ready
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {existingStore?.status === "approved"
                    ? "Your mini-store is approved. Manage products, orders and payouts from your seller workspace."
                    : "Your seller application is currently under review. You can check its status from your seller workspace."}
                </p>

                <Link
                  to="/seller"
                  className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-orange-500"
                >
                  Open seller workspace
                </Link>
              </div>
            ) : submitted ? (
              <div className="rounded-3xl border border-green-200 bg-green-50 p-10 text-center">
                <BadgeCheck
                  className="mx-auto text-green-500"
                  size={44}
                />

                <h2 className="mt-5 text-3xl font-black text-slate-950">
                  Application received
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Your corrected store details have been submitted for
                  review. Your mini-store will become public only after
                  approval.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
                  {storeWasRejected
                    ? "Correct your application"
                    : "Seller application"}
                </p>

                <h2 className="mt-3 text-4xl font-black text-slate-950">
                  {storeWasRejected
                    ? "Fix the issues and apply again"
                    : "Tell us about your business"}
                </h2>

                <p className="mt-4 text-slate-600">
                  {storeWasRejected
                    ? "Review the administrator's feedback, correct your store details and submit the application again."
                    : "Use a real business name and a clear description. You can refine branding and products after approval."}
                </p>

                {storeWasRejected && existingStore?.reviewNote && (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-red-600">
                      Administrator feedback
                    </p>

                    <p className="mt-2 leading-7 text-red-800">
                      {existingStore.reviewNote}
                    </p>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8"
                >
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Store name

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      maxLength={80}
                      placeholder="e.g. Amaka Home Essentials"
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Main category

                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      maxLength={60}
                      placeholder="e.g. Home & kitchen"
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Business location

                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                      maxLength={80}
                      placeholder="City, State"
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                    What do you sell?

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      maxLength={500}
                      rows={5}
                      placeholder="Describe your products, customers and what makes your store reliable."
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-orange-500 px-6 py-4 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-400 sm:col-span-2"
                  >
                    {submitting
                      ? "Submitting…"
                      : storeWasRejected
                        ? "Resubmit for review"
                        : "Submit for review"}
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