import {
  BadgeCheck,
  Ban,
  MapPin,
  RefreshCw,
  RotateCcw,
  Store,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

const filters = ["all", "pending", "approved", "suspended", "rejected", "removed"];

const statusStyle = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
  rejected: "bg-rose-100 text-rose-700",
  removed: "bg-slate-200 text-slate-700",
};

function AdminStores() {
  const { isAuthenticated, token, user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const loadStores = useCallback(async () => {
    if (user?.role !== "admin" || !token) return;

    setLoading(true);

    try {
      const data = await apiRequest("/api/stores/admin/all", { token });
      setStores(data.stores || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const counts = useMemo(() => {
    const result = { all: stores.length };

    for (const status of filters.slice(1)) {
      result[status] = stores.filter((store) => store.status === status).length;
    }

    return result;
  }, [stores]);

  const visibleStores = useMemo(
    () => activeFilter === "all" ? stores : stores.filter((store) => store.status === activeFilter),
    [activeFilter, stores]
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/admin/stores" }} />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  async function review(storeId, decision) {
    const note = decision === "rejected"
      ? window.prompt("What should the seller correct?")
      : "";

    if (decision === "rejected" && note === null) return;

    setBusyId(storeId);

    try {
      const data = await apiRequest(`/api/stores/admin/applications/${storeId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ decision, note }),
      });

      toast.success(data.message);
      await loadStores();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  }

  async function suspend(store) {
    const reason = window.prompt(`Why are you suspending ${store.name}?`);
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Enter a suspension reason.");
      return;
    }

    setBusyId(store._id);

    try {
      const data = await apiRequest(`/api/stores/admin/${store._id}/suspend`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ reason }),
      });

      toast.success(data.message);
      await loadStores();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  }

  async function restore(store) {
    if (!window.confirm(`Restore ${store.name} to the marketplace?`)) return;

    setBusyId(store._id);

    try {
      const data = await apiRequest(`/api/stores/admin/${store._id}/restore`, {
        method: "PATCH",
        token,
      });

      toast.success(data.message);
      await loadStores();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  }

  async function removeStore(store) {
    const reason = window.prompt(
      `Why are you ending ${store.name}'s contract? This hides the store and archives its products.`
    );

    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Enter a removal reason.");
      return;
    }

    if (!window.confirm(`Remove ${store.name} from FlexHub NG?`)) return;

    setBusyId(store._id);

    try {
      const data = await apiRequest(`/api/stores/admin/${store._id}`, {
        method: "DELETE",
        token,
        body: JSON.stringify({ reason }),
      });

      toast.success(data.message);
      await loadStores();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  }

  async function changeCommission(store) {
    const currentRate = Number(store.commissionRateBps || 0) / 100;
    const value = window.prompt(`Commission percentage for ${store.name}:`, String(currentRate));
    if (value === null) return;

    const ratePercent = Number(value);
    if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
      toast.error("Commission must be between 0 and 100.");
      return;
    }

    setBusyId(store._id);

    try {
      const data = await apiRequest(`/api/stores/admin/${store._id}/commission`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ ratePercent }),
      });

      toast.success(data.message);
      await loadStores();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-14 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Admin workspace</p>
              <h1 className="mt-3 text-4xl font-black">Seller management</h1>
              <p className="mt-3 text-slate-600">Approve applications and manage active seller contracts.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/admin/marketplace"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold hover:border-orange-400"
              >
                Marketplace admin
              </Link>
              <button
                type="button"
                onClick={loadStores}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                  activeFilter === filter
                    ? "bg-orange-500 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-orange-300"
                }`}
              >
                {filter} ({counts[filter] || 0})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
              Loading stores…
            </div>
          ) : visibleStores.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <BadgeCheck className="mx-auto text-green-600" size={42} />
              <h2 className="mt-5 text-2xl font-black">No {activeFilter === "all" ? "stores" : activeFilter + " stores"}</h2>
              <p className="mt-2 text-slate-600">There is nothing in this section right now.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6">
              {visibleStores.map((store) => (
                <article key={store._id} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <Store className="text-orange-500" />
                        <h2 className="text-2xl font-black">{store.name}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle[store.status] || "bg-slate-100 text-slate-700"}`}>
                          {store.status}
                        </span>
                      </div>

                      <p className="mt-4 leading-7 text-slate-600">{store.description}</p>

                      <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-600">
                        <span className="font-semibold">{store.category}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={16} />{store.location}</span>
                        <span>Owner: {store.owner?.firstName} {store.owner?.lastName}</span>
                        <span>{store.owner?.email}</span>
                        {store.owner?.phone && <span>{store.owner.phone}</span>}
                        <span>Commission: {Number(store.commissionRateBps || 0) / 100}%</span>
                      </div>

                      {store.reviewNote && (
                        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                          <strong>Review note:</strong> {store.reviewNote}
                        </div>
                      )}

                      {store.suspensionReason && store.status === "suspended" && (
                        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                          <strong>Suspension reason:</strong> {store.suspensionReason}
                        </div>
                      )}

                      {store.removalReason && store.status === "removed" && (
                        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                          <strong>Removal reason:</strong> {store.removalReason}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3 xl:max-w-sm xl:justify-end">
                      {store.status === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={busyId === store._id}
                            onClick={() => review(store._id, "rejected")}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle size={18} /> Reject
                          </button>
                          <button
                            type="button"
                            disabled={busyId === store._id}
                            onClick={() => review(store._id, "approved")}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <BadgeCheck size={18} /> Approve
                          </button>
                        </>
                      )}

                      {store.status === "approved" && (
                        <button
                          type="button"
                          disabled={busyId === store._id}
                          onClick={() => suspend(store)}
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-4 py-3 font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                        >
                          <Ban size={18} /> Suspend
                        </button>
                      )}

                      {store.status === "suspended" && (
                        <button
                          type="button"
                          disabled={busyId === store._id}
                          onClick={() => restore(store)}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <RotateCcw size={18} /> Restore
                        </button>
                      )}

                      {["approved", "suspended"].includes(store.status) && (
                        <button
                          type="button"
                          disabled={busyId === store._id}
                          onClick={() => changeCommission(store)}
                          className="rounded-xl border border-slate-300 px-4 py-3 font-bold hover:border-orange-400 disabled:opacity-50"
                        >
                          Commission
                        </button>
                      )}

                      {store.status !== "removed" && (
                        <button
                          type="button"
                          disabled={busyId === store._id}
                          onClick={() => removeStore(store)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={18} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default AdminStores; 