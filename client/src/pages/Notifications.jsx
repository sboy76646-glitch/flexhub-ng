import { Bell, CheckCheck, Package, Star, Truck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

const icons = { order: Package, payment: Wallet, delivery: Truck, review: Star, review_reply: Star };

function formatDate(value) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function Notifications() {
  const { isAuthenticated, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiRequest("/api/notifications?limit=100", { token })
      .then((data) => setItems(data.notifications || []))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: "/notifications" }} />;

  async function markRead(item) {
    if (item.readAt) return;
    try {
      const data = await apiRequest(`/api/notifications/${item._id}/read`, { method: "PATCH", token });
      setItems((current) => current.map((entry) => entry._id === item._id ? data.notification : entry));
      window.dispatchEvent(new Event("flexhub:notifications-updated"));
    } catch (error) { toast.error(error.message); }
  }

  async function markAll() {
    try {
      await apiRequest("/api/notifications/read-all", { method: "PATCH", token });
      const now = new Date().toISOString();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || now })));
      window.dispatchEvent(new Event("flexhub:notifications-updated"));
      toast.success("All notifications marked as read.");
    } catch (error) { toast.error(error.message); }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-12 text-slate-900">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">Activity</p><h1 className="mt-2 text-4xl font-black">Notifications</h1><p className="mt-2 text-slate-600">Payment, delivery, review and seller updates in one place.</p></div>
            <button onClick={markAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold hover:border-orange-400"><CheckCheck size={18} />Mark all read</button>
          </div>

          {loading ? <div className="mt-10 rounded-3xl bg-white p-12 text-center text-slate-500">Loading notifications…</div> : items.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center"><Bell className="mx-auto text-slate-400" size={38} /><h2 className="mt-4 text-xl font-black">No notifications yet</h2><p className="mt-2 text-slate-500">Important marketplace updates will appear here.</p></div>
          ) : (
            <div className="mt-8 grid gap-3">
              {items.map((item) => {
                const Icon = icons[item.type] || Bell;
                const content = <div className={`flex gap-4 rounded-2xl border p-5 transition ${item.readAt ? "border-slate-200 bg-white" : "border-orange-200 bg-orange-50"}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-orange-400"><Icon size={20} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-black text-slate-950">{item.title}</h2>{!item.readAt && <span className="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black uppercase text-white">New</span>}</div><p className="mt-1 leading-6 text-slate-600">{item.message}</p><p className="mt-2 text-xs font-semibold text-slate-400">{formatDate(item.createdAt)}</p></div></div>;
                return item.link ? <Link key={item._id} to={item.link} onClick={() => markRead(item)}>{content}</Link> : <button key={item._id} className="text-left" onClick={() => markRead(item)}>{content}</button>;
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
