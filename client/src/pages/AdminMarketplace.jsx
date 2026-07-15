import {
  BadgeCheck,
  Banknote,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

const tabs = [
  ["products", "Product review", PackageSearch],
  ["orders", "Orders", ShoppingBag],
  ["payouts", "Payouts", Wallet],
  ["commissions", "Commissions", Banknote],
];

const payoutColours = {
  success: "bg-green-100 text-green-700",
  eligible: "bg-blue-100 text-blue-700",
  queued: "bg-violet-100 text-violet-700",
  holding: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  reversed: "bg-red-100 text-red-700",
  blocked: "bg-slate-200 text-slate-700",
};

function money(value = 0) {
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

function shortDate(value) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value));
}

function groupItemsByStore(items) {
  const groups = new Map();

  items.forEach((item) => {
    const store = item.store || {};
    const id = String(store._id || store);
    if (!groups.has(id)) groups.set(id, { id, store, items: [] });
    groups.get(id).items.push(item);
  });

  return [...groups.values()];
}

function CommissionRow({ store, token, onUpdated }) {
  const [rate, setRate] = useState(store.commissionRateBps / 100);
  const [saving, setSaving] = useState(false);

  async function saveRate(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await apiRequest(`/api/stores/admin/${store._id}/commission`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ ratePercent: rate }),
      });
      onUpdated(data.store);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveRate} className="grid gap-4 rounded-2xl border border-slate-200 p-5 md:grid-cols-[1fr_150px_auto] md:items-center">
      <div>
        <p className="font-black text-slate-950">{store.name}</p>
        <p className="mt-1 text-sm text-slate-500">{store.owner?.firstName} {store.owner?.lastName} · {store.status}</p>
      </div>
      <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3">
        <input type="number" min="0" max="100" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} className="min-w-0 flex-1 py-3 outline-none" aria-label={`${store.name} commission percentage`} />
        <span className="font-bold text-slate-500">%</span>
      </label>
      <button disabled={saving} className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save rate"}</button>
    </form>
  );
}

function AdminMarketplace() {
  const { isAuthenticated, token, user } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [payoutMeta, setPayoutMeta] = useState({
    totals: { gross: 0, commission: 0, sellerNet: 0 },
    transfersEnabled: false,
    automationEnabled: false,
  });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") return undefined;
    let cancelled = false;

    Promise.all([
      apiRequest("/api/products/admin/review", { token }),
      apiRequest("/api/orders/admin", { token }),
      apiRequest("/api/payouts/admin", { token }),
      apiRequest("/api/stores/admin/all", { token }),
    ])
      .then(([productData, orderData, payoutData, storeData]) => {
        if (cancelled) return;
        setProducts(productData.products);
        setOrders(orderData.orders);
        setPayouts(payoutData.payouts);
        setPayoutMeta(payoutData);
        setStores(storeData.stores);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  const paidOrderCount = useMemo(
    () => orders.filter((order) => order.paymentStatus === "paid").length,
    [orders]
  );

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: "/admin/marketplace" }} />;
  if (user?.role !== "admin") return <Navigate to="/profile" replace />;

  async function reviewProduct(productId, decision) {
    const note = decision === "rejected" ? window.prompt("Tell the seller what needs changing:") : "";
    if (decision === "rejected" && note === null) return;
    setBusy(productId);

    try {
      const data = await apiRequest(`/api/products/admin/review/${productId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ decision, note }),
      });
      setProducts((current) => current.filter((product) => product._id !== productId));
      toast.success(data.message);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function updateDelivery(orderId, storeId, status) {
    setBusy(`${orderId}-${storeId}`);
    try {
      const data = await apiRequest(`/api/orders/admin/${orderId}/stores/${storeId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      toast.success(data.message);

      const [orderResult, payoutResult] = await Promise.all([
        apiRequest("/api/orders/admin", { token }),
        apiRequest("/api/payouts/admin", { token }),
      ]);
      setOrders(orderResult.orders);
      setPayouts(payoutResult.payouts);
      setPayoutMeta(payoutResult);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function processPayouts() {
    setBusy("process-payouts");
    try {
      const data = await apiRequest("/api/payouts/admin/process", {
        method: "POST",
        token,
      });
      toast.success(`${data.processed} payout${data.processed === 1 ? "" : "s"} sent to the transfer queue.`);
      const refreshed = await apiRequest("/api/payouts/admin", { token });
      setPayouts(refreshed.payouts);
      setPayoutMeta(refreshed);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function retryPayout(payoutId) {
    setBusy(payoutId);
    try {
      const data = await apiRequest(`/api/payouts/admin/${payoutId}/retry`, {
        method: "POST",
        token,
      });
      setPayouts((current) => current.map((payout) => payout._id === payoutId ? { ...payout, ...data.payout, status: "eligible" } : payout));
      toast.success(data.message);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  function updateCommissionStore(updatedStore) {
    setStores((current) => current.map((store) => store._id === updatedStore._id ? { ...store, ...updatedStore } : store));
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-100 py-10 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Marketplace control room</p>
              <h1 className="mt-2 text-4xl font-black">Review, orders and seller money</h1>
              <p className="mt-2 max-w-2xl text-slate-600">The checks that keep FlexHub NG trustworthy without slowing good sellers down.</p>
            </div>
            <Link to="/admin/stores" className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold hover:border-orange-400"><Store size={18} />Store applications</Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Products to review", products.length, ClipboardCheck],
              ["Paid orders", paidOrderCount, ShoppingBag],
              ["Platform commission", money(payoutMeta.totals.commission), Banknote],
              ["Seller payouts", money(payoutMeta.totals.sellerNet), Wallet],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="text-orange-500" size={22} /><p className="mt-4 text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>
            ))}
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
            {tabs.map(([id, label, Icon]) => (
              <button key={id} type="button" onClick={() => setTab(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 font-bold ${tab === id ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={18} />{label}</button>
            ))}
          </div>

          {loading && <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-slate-500">Loading marketplace operations…</div>}
          {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}

          {!loading && !error && tab === "products" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div><h2 className="text-2xl font-black">Product approval queue</h2><p className="mt-1 text-slate-600">Check the listing, image, price and description before shoppers see it.</p></div>
              {products.length === 0 ? (
                <div className="mt-7 rounded-2xl bg-green-50 p-10 text-center"><BadgeCheck className="mx-auto text-green-600" size={38} /><p className="mt-4 font-black text-green-800">The product queue is clear.</p></div>
              ) : (
                <div className="mt-7 grid gap-5">
                  {products.map((product) => (
                    <article key={product._id} className="grid gap-5 rounded-2xl border border-slate-200 p-5 lg:grid-cols-[140px_1fr_auto] lg:items-center">
                      <img src={product.imageUrl} alt={product.name} className="h-32 w-full rounded-xl object-cover lg:w-32" />
                      <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-black">{product.name}</h3><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Pending</span></div><p className="mt-2 text-sm font-bold text-orange-600">{product.store?.name} · {product.category}</p><p className="mt-3 line-clamp-2 leading-6 text-slate-600">{product.description}</p><p className="mt-3 text-sm text-slate-500">{money(product.price)} · {product.stock} in stock · Seller: {product.seller?.firstName} {product.seller?.lastName}</p></div>
                      <div className="flex gap-2 lg:flex-col"><button type="button" disabled={busy === product._id} onClick={() => reviewProduct(product._id, "approved")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-bold text-white disabled:opacity-50"><CheckCircle2 size={17} />Approve</button><button type="button" disabled={busy === product._id} onClick={() => reviewProduct(product._id, "rejected")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><XCircle size={17} />Return</button></div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && !error && tab === "orders" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div><h2 className="text-2xl font-black">Marketplace orders</h2><p className="mt-1 text-slate-600">Delivery is confirmed store by store, so each seller enters payout separately.</p></div>
              {orders.length === 0 ? <div className="mt-7 rounded-2xl bg-slate-50 p-10 text-center text-slate-500">No orders yet.</div> : <div className="mt-7 grid gap-6">{orders.map((order) => (
                <article key={order._id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Order {order.reference.slice(-8).toUpperCase()}</p><h3 className="mt-2 text-xl font-black">{order.customer?.firstName} {order.customer?.lastName}</h3><p className="mt-1 text-sm text-slate-500">{shortDate(order.createdAt)} · {money(order.total)}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{order.paymentStatus}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">{order.fulfillmentStatus}</span>{order.paymentStatus === "paid" && order.inventoryStatus !== "committed" && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Inventory check</span>}</div></div>
                  {order.inventoryIssue && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{order.inventoryIssue}</p>}
                  <div className="mt-5 grid gap-4">{groupItemsByStore(order.items).map((group) => {
                    const status = group.items[0]?.fulfillmentStatus || "pending";
                    const groupBusy = busy === `${order._id}-${group.id}`;
                    return <div key={group.id} className="rounded-xl bg-slate-50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">{group.store.name || "Store"}</p><p className="mt-1 text-sm text-slate-500">{group.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-slate-700">{status}</span>{order.paymentStatus === "paid" && !["delivered", "cancelled"].includes(status) && order.inventoryStatus === "committed" && <button type="button" disabled={groupBusy} onClick={() => updateDelivery(order._id, group.id, "delivered")} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Confirm delivery</button>}</div></div></div>;
                  })}</div>
                  <p className="mt-5 text-sm leading-6 text-slate-600"><strong>Delivery:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} · {order.shippingAddress.phone}</p>
                </article>
              ))}</div>}
            </div>
          )}

          {!loading && !error && tab === "payouts" && (
            <div className="mt-6 space-y-6">
              <div className={`rounded-2xl border p-5 ${payoutMeta.transfersEnabled ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><ShieldCheck className={payoutMeta.transfersEnabled ? "text-green-700" : "text-amber-700"} /><div><p className="font-black">{payoutMeta.transfersEnabled ? "Live transfers enabled" : "Live transfers safely disabled"}</p><p className="mt-1 text-sm text-slate-600">{payoutMeta.automationEnabled ? "Eligible payouts are checked automatically." : "No seller money can move automatically in this review version."}</p></div></div><button type="button" disabled={!payoutMeta.transfersEnabled || busy === "process-payouts"} onClick={processPayouts} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><RefreshCw size={17} />Process eligible payouts</button></div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black">Payout and commission ledger</h2>
                {payouts.length === 0 ? <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center text-slate-500">Delivered order earnings will appear here.</div> : <div className="mt-6 grid gap-4">{payouts.map((payout) => <article key={payout._id} className="grid gap-4 rounded-2xl border border-slate-200 p-5 lg:grid-cols-[1fr_repeat(3,auto)_auto] lg:items-center"><div><p className="font-black">{payout.store?.name}</p><p className="mt-1 text-xs text-slate-500">Order {payout.order?.reference?.slice(-8).toUpperCase()} · Hold to {shortDate(payout.holdUntil)}</p>{payout.failureMessage && <p className="mt-2 text-xs font-semibold text-red-600">{payout.failureMessage}</p>}</div><div><p className="text-xs text-slate-500">Gross</p><p className="font-bold">{money(payout.grossAmount)}</p></div><div><p className="text-xs text-slate-500">Commission</p><p className="font-bold text-orange-600">{money(payout.commissionAmount)}</p></div><div><p className="text-xs text-slate-500">Seller net</p><p className="font-bold text-green-700">{money(payout.netAmount)}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${payoutColours[payout.status]}`}>{payout.status}</span>{["failed", "reversed", "blocked"].includes(payout.status) && <button type="button" disabled={busy === payout._id} onClick={() => retryPayout(payout._id)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold disabled:opacity-50">Retry</button>}</div></article>)}</div>}
              </div>
            </div>
          )}

          {!loading && !error && tab === "commissions" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3"><Boxes className="text-orange-500" /><div><h2 className="text-2xl font-black">Commission rates by store</h2><p className="mt-1 max-w-3xl text-slate-600">The saved rate applies only to new checkout items. Existing orders keep the exact rate and amounts they were created with.</p></div></div>
              <div className="mt-7 grid gap-4">{stores.filter((store) => store.status === "approved").map((store) => <CommissionRow key={store._id} store={store} token={token} onUpdated={updateCommissionStore} />)}</div>
              {stores.every((store) => store.status !== "approved") && <div className="mt-7 rounded-2xl bg-slate-50 p-10 text-center text-slate-500">Approve a seller store before setting its commission.</div>}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default AdminMarketplace;
