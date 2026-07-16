import {
  AlertCircle,
  Archive,
  BadgeCheck,
  BarChart3,
  Clock3,
  Landmark,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProductImagePicker from "../components/seller/ProductImagePicker";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { uploadProductImage } from "../services/cloudinary";

const statusDetails = {
  pending: {
    icon: Clock3,
    title: "Application under review",
    body: "Your mini-store stays private while the FlexHub NG team checks the details.",
    colour: "text-amber-700",
    panel: "border-amber-200 bg-amber-50",
  },
  approved: {
    icon: BadgeCheck,
    title: "Your mini-store is live",
    body: "Customers can discover your store and buy products that have passed product review.",
    colour: "text-green-700",
    panel: "border-green-200 bg-green-50",
  },
  rejected: {
    icon: XCircle,
    title: "Changes are required",
    body: "Review the admin note below before sending corrected business details.",
    colour: "text-red-700",
    panel: "border-red-200 bg-red-50",
  },
  suspended: {
    icon: AlertCircle,
    title: "Store access is paused",
    body: "Your products are hidden while the FlexHub NG team reviews this store.",
    colour: "text-red-700",
    panel: "border-red-200 bg-red-50",
  },
};

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "payouts", label: "Payouts", icon: Wallet },
];

const productStatusStyle = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  draft: "bg-slate-100 text-slate-600",
  archived: "bg-slate-200 text-slate-500",
};

const payoutStatusStyle = {
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
  return value
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value))
    : "—";
}

function SellerDashboard() {
  const { isAuthenticated, token } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payoutData, setPayoutData] = useState({
    payouts: [],
    totals: { gross: 0, commission: 0, net: 0, paid: 0, available: 0, pending: 0 },
    payoutAccount: { status: "unconfigured" },
    commissionRatePercent: 10,
    automationEnabled: false,
    holdDays: 7,
  });
  const [busy, setBusy] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [banks, setBanks] = useState([]);
  const [bankError, setBankError] = useState("");
  const [bankLoading, setBankLoading] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    apiRequest("/api/stores/mine", { token })
      .then((data) => {
        if (!cancelled) setStore(data.store);
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
  }, [token]);

  useEffect(() => {
    if (store?.status !== "approved" || !token) return undefined;
    let cancelled = false;

    Promise.all([
      apiRequest("/api/products/seller", { token }),
      apiRequest("/api/orders/seller", { token }),
      apiRequest("/api/payouts/seller", { token }),
    ])
      .then(([productResult, orderResult, payoutResult]) => {
        if (cancelled) return;
        setProducts(productResult.products);
        setOrders(orderResult.orders);
        setPayoutData(payoutResult);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setDashboardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [store?.status, token]);

  const metrics = useMemo(() => {
    const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
    return {
      liveProducts: products.filter((product) => product.status === "approved").length,
      reviewProducts: products.filter((product) => product.status === "pending").length,
      openOrders: paidOrders.filter((order) => !["delivered", "cancelled"].includes(order.fulfillmentStatus)).length,
      sales: paidOrders.reduce((total, order) => total + order.grossAmount, 0),
    };
  }, [orders, products]);

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: "/seller" }} />;

  const details = store ? statusDetails[store.status] : null;
  const StatusIcon = details?.icon;

  async function submitProduct(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const submitAction = event.nativeEvent.submitter?.value || "submit";
    const form = new FormData(formElement);
    setBusy("product-create");

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploadedImage = await uploadProductImage(imageFile);
        finalImageUrl = uploadedImage.url;
      }

      if (!finalImageUrl) {
        throw new Error("Choose a product image before saving.");
      }

      const data = await apiRequest(
        editingProduct ? `/api/products/seller/${editingProduct._id}` : "/api/products/seller",
        {
          method: editingProduct ? "PATCH" : "POST",
          token,
          body: JSON.stringify({
            name: form.get("name"),
            category: form.get("category"),
            description: form.get("description"),
            imageUrl: finalImageUrl,
            price: form.get("price"),
            oldPrice: form.get("oldPrice"),
            stock: form.get("stock"),
            saveAsDraft: submitAction === "draft",
            submitForReview: submitAction === "submit",
          }),
        }
      );
      setProducts((current) => editingProduct
        ? current.map((product) => product._id === editingProduct._id ? data.product : product)
        : [data.product, ...current]
      );
      formElement.reset();
      setImageUrl("");
      setImageFile(null);
      setEditingProduct(null);
      toast.success(data.message);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  function startEditingProduct(product) {
    setEditingProduct(product);
    setImageUrl(product.imageUrl);
    setImageFile(null);
    window.requestAnimationFrame(() => {
      document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function cancelEditingProduct() {
    setEditingProduct(null);
    setImageUrl("");
    setImageFile(null);
  }

  async function updateStock(product) {
    const value = window.prompt(`How many units of ${product.name} are available?`, product.stock);
    if (value === null) return;
    setBusy(product._id);

    try {
      const data = await apiRequest(`/api/products/seller/${product._id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ stock: value }),
      });
      setProducts((current) => current.map((item) => item._id === product._id ? data.product : item));
      toast.success(data.message);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function archiveProduct(product) {
    if (!window.confirm(`Remove ${product.name} from your store?`)) return;
    setBusy(product._id);

    try {
      const data = await apiRequest(`/api/products/seller/${product._id}`, {
        method: "DELETE",
        token,
      });
      setProducts((current) => current.map((item) => item._id === product._id ? data.product : item));
      toast.success(data.message);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function updateOrderStatus(orderId, status) {
    setBusy(orderId);
    try {
      const data = await apiRequest(`/api/orders/seller/${orderId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((order) => order.id === orderId ? data.order : order));
      toast.success(data.message);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function loadBanks() {
    setBankLoading(true);
    setBankError("");
    try {
      const data = await apiRequest("/api/payouts/seller/banks", { token });
      setBanks(data.banks);
    } catch (requestError) {
      setBankError(requestError.message);
    } finally {
      setBankLoading(false);
    }
  }

  async function configureBankAccount(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy("bank-account");

    try {
      const data = await apiRequest("/api/payouts/seller/account", {
        method: "POST",
        token,
        body: JSON.stringify({
          bankCode: form.get("bankCode"),
          accountNumber: form.get("accountNumber"),
        }),
      });
      setPayoutData((current) => ({ ...current, payoutAccount: data.payoutAccount }));
      formElement.reset();
      toast.success(data.message);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-100 py-10 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Seller workspace</p>
              <h1 className="mt-2 text-4xl font-black">{store?.name || "Your mini-store"}</h1>
              {store?.status === "approved" && (
                <p className="mt-2 text-slate-600">The practical side of running your store, all in one place.</p>
              )}
            </div>
            {store?.status === "approved" && (
              <Link to={`/stores/${store.slug}`} className="w-fit rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold hover:border-orange-400 hover:text-orange-600">
                View public store
              </Link>
            )}
          </div>

          {loading && <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading your store…</div>}
          {error && <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>}

          {!loading && !error && !store && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <Store className="text-orange-500" size={36} />
              <h2 className="mt-5 text-2xl font-black">You have not applied for a mini-store yet</h2>
              <p className="mt-3 text-slate-600">Start with your business name, category, location and a short description.</p>
              <Link to="/sell#apply" className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-white">Start application</Link>
            </div>
          )}

          {store && store.status !== "approved" && details && (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className={`flex items-start gap-4 rounded-2xl border p-5 ${details.panel}`}>
                  <StatusIcon className={details.colour} size={28} />
                  <div>
                    <h2 className={`text-xl font-black ${details.colour}`}>{details.title}</h2>
                    <p className="mt-2 leading-7 text-slate-600">{details.body}</p>
                  </div>
                </div>
                <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div><dt className="text-sm font-semibold text-slate-500">Store name</dt><dd className="mt-1 text-xl font-bold">{store.name}</dd></div>
                  <div><dt className="text-sm font-semibold text-slate-500">Category</dt><dd className="mt-1 text-xl font-bold">{store.category}</dd></div>
                  <div><dt className="text-sm font-semibold text-slate-500">Location</dt><dd className="mt-1 text-xl font-bold">{store.location}</dd></div>
                  <div><dt className="text-sm font-semibold text-slate-500">Visibility</dt><dd className="mt-1 text-xl font-bold">Private</dd></div>
                </dl>
                {store.reviewNote && (
                  <div className="mt-8 rounded-2xl bg-slate-100 p-5">
                    <p className="text-sm font-bold text-slate-500">Admin note</p>
                    <p className="mt-2 text-slate-700">{store.reviewNote}</p>
                  </div>
                )}

                {store.status === "rejected" && (
                  <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <h3 className="text-lg font-black text-red-800">
                      Correct your store application
                    </h3>
                    <p className="mt-2 leading-7 text-red-700">
                      Update the details mentioned in the administrator's note, then
                      submit the application again for another review.
                    </p>
                    <Link
                      to="/sell#apply"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                    >
                      <Pencil size={18} />
                      Edit and resubmit
                    </Link>
                  </div>
                )}
              </div>
              <aside className="rounded-3xl bg-slate-900 p-8 text-white">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-400">How approval works</p>
                <ol className="mt-6 space-y-5 text-slate-300">
                  <li>1. Business details submitted</li>
                  <li>2. Admin reviews the application</li>
                  <li>3. Approved stores become public</li>
                  <li>4. Products are reviewed before going live</li>
                </ol>
              </aside>
            </div>
          )}

          {store?.status === "approved" && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
              <aside className="h-fit rounded-3xl bg-slate-950 p-4 text-white lg:sticky lg:top-28">
                <div className="rounded-2xl border border-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 font-black">
                      {store.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black">{store.name}</p>
                      <p className="text-xs text-green-400">Approved seller</p>
                    </div>
                  </div>
                </div>
                <nav className="mt-3 grid gap-1" aria-label="Seller dashboard">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => setTab(id)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition ${tab === id ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>
                      <Icon size={19} />{label}
                    </button>
                  ))}
                </nav>
              </aside>

              <main>
                {dashboardLoading ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-10 text-slate-500">Preparing your dashboard…</div>
                ) : (
                  <>
                    {tab === "overview" && (
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          {[
                            ["Sales", money(metrics.sales), "Paid orders only"],
                            ["Open orders", metrics.openOrders, "Needs your attention"],
                            ["Live products", metrics.liveProducts, `${metrics.reviewProducts} awaiting review`],
                            ["Paid out", money(payoutData.totals.paid), "Completed transfers"],
                          ].map(([label, value, note]) => (
                            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                              <p className="text-sm font-bold text-slate-500">{label}</p>
                              <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
                              <p className="mt-2 text-xs text-slate-500">{note}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                              <div><p className="text-sm font-bold text-orange-600">Right now</p><h2 className="mt-1 text-2xl font-black">Work that needs attention</h2></div>
                              <button type="button" onClick={() => setTab("products")} className="text-sm font-bold text-orange-600">Manage products</button>
                            </div>
                            <div className="mt-6 grid gap-3">
                              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-slate-600">Products awaiting approval</span><strong>{metrics.reviewProducts}</strong></div>
                              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-slate-600">Paid orders to fulfil</span><strong>{metrics.openOrders}</strong></div>
                              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-slate-600">Earnings in payout cycle</span><strong>{money(payoutData.totals.pending + payoutData.totals.available)}</strong></div>
                            </div>
                          </div>
                          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-400">Your marketplace rate</p>
                            <p className="mt-4 text-5xl font-black">{payoutData.commissionRatePercent}%</p>
                            <p className="mt-3 leading-7 text-slate-300">Commission is locked into each order when the customer checks out, so later rate changes never rewrite old earnings.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === "products" && (
                      <div className="space-y-6">
                        <form id="product-editor" key={editingProduct?._id || "new-product"} onSubmit={submitProduct} className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                          <div className="flex items-start gap-3"><PackagePlus className="mt-1 text-orange-500" /><div><h2 className="text-2xl font-black">{editingProduct ? `Edit ${editingProduct.name}` : "Add a product"}</h2><p className="mt-1 text-slate-600">Give shoppers the useful details. Admin approval keeps the marketplace tidy.</p></div></div>
                          <div className="mt-7 grid gap-5 md:grid-cols-2">
                            <label className="grid gap-2 text-sm font-bold">Product name<input name="name" defaultValue={editingProduct?.name || ""} required maxLength="120" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" placeholder="e.g. Handmade leather tote" /></label>
                            <label className="grid gap-2 text-sm font-bold">Category<input name="category" defaultValue={editingProduct?.category || ""} required maxLength="60" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" placeholder="e.g. Fashion" /></label>
                            <label className="grid gap-2 text-sm font-bold">Selling price (₦)<input name="price" defaultValue={editingProduct?.price || ""} type="number" min="100" max="1000000000" step="1" required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" placeholder="25000" /></label>
                            <label className="grid gap-2 text-sm font-bold">Old price, if discounted (₦)<input name="oldPrice" defaultValue={editingProduct?.oldPrice || ""} type="number" min="100" max="1000000000" step="1" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" placeholder="30000" /></label>
                            <label className="grid gap-2 text-sm font-bold">Units in stock<input name="stock" defaultValue={editingProduct?.stock ?? ""} type="number" min="0" max="99999" step="1" required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" placeholder="10" /></label>
                            <div className="sm:col-span-2">
                              <ProductImagePicker file={imageFile} onChange={setImageFile} disabled={busy === "product-create"} />
                              {editingProduct && imageUrl && !imageFile && (
                                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <img src={imageUrl} alt="Current product" className="h-20 w-20 rounded-xl object-cover" />
                                  <div>
                                    <p className="font-bold text-slate-900">Current product image</p>
                                    <p className="mt-1 text-sm text-slate-600">Choose a new file above only when you want to replace it.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <label className="grid gap-2 text-sm font-bold md:col-span-2">Description<textarea name="description" defaultValue={editingProduct?.description || ""} required maxLength="2000" rows="4" className="rounded-xl border border-slate-300 px-4 py-3 font-normal leading-7 outline-none focus:border-orange-500" placeholder="What should a buyer know before ordering?" /></label>
                          </div>
                          <div className="mt-6 flex flex-wrap gap-3">
                            <button name="action" value="submit" disabled={busy === "product-create"} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"><Plus size={18} />{editingProduct ? "Save and submit" : "Submit for approval"}</button>
                            <button name="action" value="draft" disabled={busy === "product-create"} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Save draft</button>
                            {editingProduct && <button type="button" onClick={cancelEditingProduct} className="rounded-xl px-5 py-3 font-bold text-slate-500 hover:bg-slate-100">Cancel editing</button>}
                          </div>
                        </form>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                          <div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-black">Your catalogue</h2><p className="mt-1 text-slate-600">{products.length} product{products.length === 1 ? "" : "s"}</p></div></div>
                          {products.length === 0 ? (
                            <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center text-slate-500">Your first product will appear here.</div>
                          ) : (
                            <div className="mt-6 grid gap-4">
                              {products.map((product) => (
                                <article key={product._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                                  <img src={product.imageUrl} alt="" className="h-24 w-full rounded-xl object-cover sm:w-24" />
                                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-950">{product.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${productStatusStyle[product.status]}`}>{product.status}</span></div><p className="mt-2 text-sm text-slate-500">{money(product.price)} · {product.stock} in stock</p>{product.reviewNote && <p className="mt-2 text-sm text-red-600">Admin note: {product.reviewNote}</p>}</div>
                                  <div className="flex shrink-0 flex-wrap gap-2"><button type="button" disabled={product.status === "archived"} onClick={() => startEditingProduct(product)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold hover:border-orange-400 disabled:opacity-40"><Pencil size={15} />Edit</button><button type="button" disabled={busy === product._id || product.status === "archived"} onClick={() => updateStock(product)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold hover:border-orange-400 disabled:opacity-40"><RefreshCw size={15} />Stock</button><button type="button" disabled={busy === product._id || product.status === "archived"} onClick={() => archiveProduct(product)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"><Archive size={15} />Archive</button></div>
                                </article>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {tab === "orders" && (
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div><h2 className="text-2xl font-black">Marketplace orders</h2><p className="mt-1 text-slate-600">You only see the items and earnings that belong to your store.</p></div>
                        {orders.length === 0 ? (
                          <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center text-slate-500">New customer orders will appear here.</div>
                        ) : (
                          <div className="mt-7 grid gap-5">
                            {orders.map((order) => (
                              <article key={order.id} className="rounded-2xl border border-slate-200 p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Order {order.reference.slice(-8).toUpperCase()}</p><p className="mt-2 text-sm text-slate-500">{shortDate(order.createdAt)}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{order.paymentStatus}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{order.fulfillmentStatus}</span></div></div>
                                <div className="mt-5 grid gap-3">{order.items.map((item) => <div key={item.product} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" /><div className="flex-1"><p className="font-bold">{item.name}</p><p className="text-sm text-slate-500">{item.quantity} × {money(item.unitPrice)}</p></div><strong>{money(item.lineTotal)}</strong></div>)}</div>
                                <div className="mt-5 grid gap-4 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-[1fr_auto]"><div><p className="font-bold">Deliver to {order.shippingAddress.fullName}</p><p className="mt-1 leading-6 text-slate-600">{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} · {order.shippingAddress.phone}</p></div><div className="sm:text-right"><p className="text-slate-500">Your net earning</p><p className="mt-1 text-xl font-black text-green-700">{money(order.sellerNet)}</p></div></div>
                                {order.inventoryStatus !== "committed" && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">Inventory is still being confirmed. Do not ship yet.</p>}
                                {order.paymentStatus === "paid" && !["delivered", "cancelled"].includes(order.fulfillmentStatus) && order.inventoryStatus === "committed" && (
                                  <div className="mt-5 flex flex-wrap gap-3">
                                    {order.fulfillmentStatus === "pending" && <button type="button" disabled={busy === order.id} onClick={() => updateOrderStatus(order.id, "processing")} className="rounded-xl bg-slate-900 px-4 py-2.5 font-bold text-white disabled:opacity-50">Start preparing</button>}
                                    {["pending", "processing"].includes(order.fulfillmentStatus) && <button type="button" disabled={busy === order.id} onClick={() => updateOrderStatus(order.id, "shipped")} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-bold text-white disabled:opacity-50"><Truck size={17} />Mark shipped</button>}
                                  </div>
                                )}
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {tab === "payouts" && (
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          {[
                            ["Gross sales", payoutData.totals.gross],
                            ["Commission", payoutData.totals.commission],
                            ["Available", payoutData.totals.available],
                            ["Paid out", payoutData.totals.paid],
                          ].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-3 text-3xl font-black">{money(value)}</p></div>)}
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-3"><Landmark className="text-orange-500" /><div><h2 className="text-xl font-black">Payout account</h2><p className="mt-1 text-sm text-slate-600">Only the verified account name and last four digits are stored here.</p></div></div>
                            {payoutData.payoutAccount.status === "verified" ? (
                              <div className="mt-6 rounded-2xl bg-green-50 p-5"><p className="font-black text-green-800">{payoutData.payoutAccount.accountName}</p><p className="mt-2 text-sm text-green-700">{payoutData.payoutAccount.bankName} ·•••• {payoutData.payoutAccount.accountLast4}</p><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-green-700">Verified for payouts</p></div>
                            ) : banks.length === 0 ? (
                              <div className="mt-6"><p className="text-sm leading-6 text-slate-600">Set this up before your first payout becomes due. Paystack verifies the name directly with the bank.</p><button type="button" onClick={loadBanks} disabled={bankLoading} className="mt-5 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-50">{bankLoading ? "Loading banks…" : "Set up bank account"}</button>{bankError && <p className="mt-3 text-sm text-red-600">{bankError}</p>}</div>
                            ) : (
                              <form onSubmit={configureBankAccount} className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-bold">Bank<select name="bankCode" required className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal"><option value="">Choose your bank</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">10-digit account number<input name="accountNumber" required inputMode="numeric" pattern="[0-9]{10}" maxLength="10" className="rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label><button disabled={busy === "bank-account"} className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-white disabled:opacity-50">Verify payout account</button></form>
                            )}
                          </div>

                          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-black">How your money moves</h2>
                            <div className="mt-5 grid gap-3 text-sm text-slate-600"><div className="rounded-xl bg-slate-50 p-4"><strong className="text-slate-900">1. Customer pays:</strong> the order amount is checked on the server.</div><div className="rounded-xl bg-slate-50 p-4"><strong className="text-slate-900">2. Admin confirms delivery:</strong> your net earning enters a {payoutData.holdDays}-day safety hold.</div><div className="rounded-xl bg-slate-50 p-4"><strong className="text-slate-900">3. Payout becomes eligible:</strong> transfer processing uses your verified Paystack recipient.</div></div>
                            <p className={`mt-5 rounded-xl p-3 text-sm font-bold ${payoutData.automationEnabled ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{payoutData.automationEnabled ? "Automated payouts are active." : "Automated transfers are safely switched off during setup."}</p>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                          <h2 className="text-xl font-black">Payout history</h2>
                          {payoutData.payouts.length === 0 ? <div className="mt-5 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">Delivered-order earnings will appear here.</div> : <div className="mt-5 grid gap-3">{payoutData.payouts.map((payout) => <div key={payout._id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-bold">Order {payout.order?.reference?.slice(-8).toUpperCase()}</p><p className="mt-1 text-xs text-slate-500">Hold ends {shortDate(payout.holdUntil)}</p></div><div className="sm:text-right"><p className="font-black">{money(payout.netAmount)}</p><p className="text-xs text-slate-500">after {money(payout.commissionAmount)} commission</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${payoutStatusStyle[payout.status]}`}>{payout.status}</span></div>)}</div>}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default SellerDashboard; 