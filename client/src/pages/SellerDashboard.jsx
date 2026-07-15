import { BadgeCheck, Box, LoaderCircle, PackagePlus, Store, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProductImagePicker from "../components/seller/ProductImagePicker";
import { useAuth } from "../context/AuthContext";
import { uploadProductImage } from "../services/cloudinary";

const API_BASE_URL = import.meta.env.PROD
  ? "https://flexhub-ng.onrender.com"
  : import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  oldPrice: "",
  stock: "",
  description: "",
};

function SellerDashboard() {
  const { isAuthenticated, token } = useAuth();
  const [store, setStore] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const controller = new AbortController();

    async function loadSellerData() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [storeResponse, draftsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stores/me`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/products/mine`, { headers, signal: controller.signal }),
        ]);
        const storeData = await storeResponse.json();
        const draftsData = await draftsResponse.json();

        if (storeResponse.ok) setStore(storeData.store);
        if (draftsResponse.ok) setDrafts(draftsData.products || []);
      } catch (error) {
        if (error.name !== "AbortError") toast.error("Unable to load seller workspace.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadSellerData();
    return () => controller.abort();
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/seller/dashboard" }} />;
  }

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!imageFile) {
      toast.error("Choose a product image first.");
      return;
    }

    setSubmitting(true);

    try {
      const image = await uploadProductImage(imageFile);
      const response = await fetch(`${API_BASE_URL}/api/products/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
          stock: Number(form.stock),
          image,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save product draft.");

      setDrafts((current) => [data.product, ...current]);
      setForm(emptyForm);
      setImageFile(null);
      toast.success("Product draft saved.");
    } catch (error) {
      toast.error(error instanceof TypeError ? "Unable to reach the server. Please try again." : error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 border-b border-slate-800 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">Seller workspace</p>
              <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Build your mini-store</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">Add honest product information and clear photos. Drafts stay private until your store and products are approved.</p>
            </div>
            {store && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
                <p className="text-sm text-slate-400">Store</p>
                <div className="mt-1 flex items-center gap-2 font-bold text-white"><Store size={18} className="text-orange-400" />{store.name}</div>
                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${store.status === "approved" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>{store.status}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center"><LoaderCircle className="animate-spin text-orange-400" size={36} /></div>
          ) : !store ? (
            <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
              <Store className="mx-auto text-orange-400" size={44} />
              <h2 className="mt-5 text-3xl font-black text-white">Apply for a mini-store first</h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-400">A seller application connects every product draft to the correct business and owner.</p>
              <Link to="/sell#apply" className="mt-7 inline-flex rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white">Start seller application</Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-10 xl:grid-cols-[1.3fr_0.7fr]">
              <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <PackagePlus className="text-orange-400" />
                  <h2 className="text-2xl font-black text-white">Add a product draft</h2>
                </div>

                <div className="mt-8">
                  <ProductImagePicker file={imageFile} onChange={setImageFile} disabled={submitting} />
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-slate-300 sm:col-span-2">Product name<input name="name" value={form.name} onChange={handleChange} required maxLength={120} placeholder="Use the name customers would search for" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-orange-500" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-300">Category<input name="category" value={form.category} onChange={handleChange} required maxLength={60} placeholder="e.g. Sneakers" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-orange-500" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-300">Stock quantity<input name="stock" value={form.stock} onChange={handleChange} type="number" min="0" max="100000" required placeholder="0" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-orange-500" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-300">Selling price (₦)<input name="price" value={form.price} onChange={handleChange} type="number" min="1" required placeholder="25000" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-orange-500" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-300">Previous price (optional)<input name="oldPrice" value={form.oldPrice} onChange={handleChange} type="number" min="1" placeholder="30000" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-orange-500" /></label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-300 sm:col-span-2">Description<textarea name="description" value={form.description} onChange={handleChange} required maxLength={1500} rows={6} placeholder="Describe condition, size, colour, key features and what is included." className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-orange-500" /></label>
                </div>

                <button disabled={submitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700">
                  {submitting ? <><LoaderCircle className="animate-spin" size={19} />Uploading and saving…</> : <><UploadCloud size={19} />Save private draft</>}
                </button>
              </form>

              <aside>
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black text-white">Your drafts</h2><span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-bold text-slate-300">{drafts.length}</span></div>
                  <div className="mt-6 space-y-4">
                    {drafts.length ? drafts.map((product) => (
                      <article key={product.id} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <img src={product.image?.url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                        <div className="min-w-0"><h3 className="truncate font-bold text-white">{product.name}</h3><p className="mt-1 text-sm text-orange-400">₦{Number(product.price).toLocaleString()}</p><span className="mt-2 inline-flex rounded-full bg-slate-800 px-2 py-1 text-xs capitalize text-slate-400">{product.status}</span></div>
                      </article>
                    )) : (
                      <div className="py-10 text-center"><Box className="mx-auto text-slate-600" size={34} /><p className="mt-3 text-sm text-slate-400">No product drafts yet.</p></div>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-orange-500/20 bg-orange-500/5 p-6">
                  <BadgeCheck className="text-orange-400" />
                  <h3 className="mt-4 font-bold text-white">Private until reviewed</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Saving a draft does not publish it. Store and product approval remain separate checks.</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default SellerDashboard;
