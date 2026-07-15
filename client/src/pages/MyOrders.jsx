import { Clock3, PackageCheck, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

function money(value = 0) {
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

function MyOrders() {
  const { isAuthenticated, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    apiRequest("/api/orders/mine", { token })
      .then((data) => {
        if (!cancelled) setOrders(data.orders);
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
  }, [token]);

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: "/orders" }} />;

  async function resumePayment(orderId) {
    setBusy(orderId);
    try {
      const data = await apiRequest(`/api/payments/orders/${orderId}/initialize`, {
        method: "POST",
        token,
      });
      window.location.assign(data.authorizationUrl);
    } catch (error) {
      toast.error(error.message);
      setBusy("");
    }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-100 py-12 text-slate-900">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Your purchases</p>
          <h1 className="mt-2 text-4xl font-black">Orders</h1>
          <p className="mt-3 text-slate-600">Payment and delivery progress across every mini-store in one place.</p>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-slate-500">Loading your orders…</div>
          ) : orders.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm"><ShoppingBag className="mx-auto text-orange-500" size={42} /><h2 className="mt-5 text-2xl font-black">No orders yet</h2><p className="mt-2 text-slate-600">When something catches your eye, your order will appear here.</p><Link to="/shop" className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-white">Browse marketplace</Link></div>
          ) : (
            <div className="mt-8 grid gap-6">
              {orders.map((order) => (
                <article key={order._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Order {order.reference.slice(-8).toUpperCase()}</p><p className="mt-2 text-sm text-slate-500">{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(order.createdAt))}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{order.paymentStatus}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{order.fulfillmentStatus}</span></div></div>
                  <div className="mt-6 grid gap-3">{order.items.map((item) => <div key={item.product} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"><img src={item.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="font-black">{item.name}</p><Link to={`/stores/${item.storeSlug}`} className="mt-1 block text-sm font-semibold text-orange-600">{item.storeName}</Link><p className="mt-1 text-xs capitalize text-slate-500">{item.fulfillmentStatus}</p></div><div className="text-right"><p className="font-bold">{money(item.lineTotal)}</p><p className="mt-1 text-xs text-slate-500">Qty {item.quantity}</p></div></div>)}</div>
                  {order.inventoryStatus === "attention" && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">Payment is confirmed, but the team is checking a stock change before fulfilment.</p>}
                  <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm text-slate-500">{order.fulfillmentStatus === "delivered" ? <PackageCheck className="text-green-600" size={19} /> : <Clock3 className="text-orange-500" size={19} />}{order.fulfillmentStatus === "delivered" ? "Delivery completed" : `Delivering to ${order.shippingAddress.city}, ${order.shippingAddress.state}`}</div><div className="flex items-center gap-4"><strong className="text-2xl">{money(order.total)}</strong>{order.paymentStatus === "pending" && <button type="button" disabled={busy === order._id} onClick={() => resumePayment(order._id)} className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-white disabled:opacity-50">Complete payment</button>}</div></div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default MyOrders;
