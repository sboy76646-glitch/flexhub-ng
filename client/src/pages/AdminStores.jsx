import { BadgeCheck, MapPin, Store, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

function AdminStores() {
  const { isAuthenticated, token, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") return undefined;
    let cancelled = false;

    apiRequest("/api/stores/admin/applications", { token })
      .then((data) => {
        if (!cancelled) setApplications(data.stores);
      })
      .catch((error) => {
        if (!cancelled) toast.error(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: "/admin/stores" }} />;
  if (user?.role !== "admin") return <Navigate to="/profile" replace />;

  async function review(storeId, decision) {
    const note = decision === "rejected" ? window.prompt("What should the seller correct?") : "";
    if (decision === "rejected" && note === null) return;

    setBusyId(storeId);
    try {
      const data = await apiRequest(`/api/stores/admin/applications/${storeId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ decision, note }),
      });
      setApplications((current) => current.filter((store) => store._id !== storeId));
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-14 text-slate-900">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Admin workspace</p>
              <h1 className="mt-3 text-4xl font-black">Mini-store applications</h1>
              <p className="mt-3 text-slate-600">Review every business before it appears publicly.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/admin/marketplace" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold hover:border-orange-400">Marketplace admin</Link>
              <span className="w-fit rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">{applications.length} pending</span>
            </div>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading applications…</div>
          ) : applications.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <BadgeCheck className="mx-auto text-green-600" size={42} />
              <h2 className="mt-5 text-2xl font-black">The review queue is clear</h2>
              <p className="mt-2 text-slate-600">New seller applications will appear here.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6">
              {applications.map((application) => (
                <article key={application._id} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <Store className="text-orange-500" />
                        <h2 className="text-2xl font-black">{application.name}</h2>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Pending</span>
                      </div>
                      <p className="mt-4 leading-7 text-slate-600">{application.description}</p>
                      <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-600">
                        <span className="font-semibold">{application.category}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={16} />{application.location}</span>
                        <span>Owner: {application.owner?.firstName} {application.owner?.lastName}</span>
                        <span>{application.owner?.email}</span>
                        <span>{application.owner?.phone}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <button disabled={busyId === application._id} onClick={() => review(application._id, "rejected")} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><XCircle size={18} />Reject</button>
                      <button disabled={busyId === application._id} onClick={() => review(application._id, "approved")} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50"><BadgeCheck size={18} />Approve</button>
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
