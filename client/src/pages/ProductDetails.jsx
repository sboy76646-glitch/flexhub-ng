import {
  BadgeCheck,
  Film,
  MapPin,
  ShoppingCart,
  Star,
  ThumbsUp,
  Flag,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProductTrustCard from "../components/trust/ProductTrustCard";
import SellerTrustBadge from "../components/trust/SellerTrustBadge";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { apiRequest } from "../lib/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiRequest(`/api/products/${id}`)
      .then((data) => {
        if (!cancelled) setProduct(data.product || null);
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 text-slate-500">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="mt-5 font-semibold">Loading product…</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
          <h1 className="text-3xl font-black text-slate-950">Product not found</h1>
          <p className="mt-3 text-slate-600">This product may not be approved, or it may have been removed.</p>
          <Link to="/shop" className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600">Return to shop</Link>
        </div>
      </Layout>
    );
  }

  const stock = Number(product.stock || 0);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);

  function addItemToCart() {
    addToCart(product, quantity);
    toast.success("Added to cart.");
  }

  function buyNow() {
    addToCart(product, quantity);
    navigate("/checkout");
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    const form = new FormData(event.currentTarget);
    setReviewBusy(true);
    try {
      const data = await apiRequest(`/api/reviews/products/${id}`, {
        method: "POST",
        token,
        body: JSON.stringify({
          rating: Number(form.get("rating")),
          sellerRating: Number(form.get("sellerRating")),
          deliveryRating: Number(form.get("deliveryRating")),
          matchedDescription: form.get("matchedDescription") === "yes",
          comment: form.get("comment"),
        }),
      });
      toast.success(data.message);
      event.currentTarget.reset();
      const refreshed = await apiRequest(`/api/products/${id}`);
      setProduct(refreshed.product);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setReviewBusy(false);
    }
  }


  async function toggleHelpful(reviewId) {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    try {
      const data = await apiRequest(`/api/reviews/${reviewId}/helpful`, { method: "POST", token });
      setProduct((current) => ({
        ...current,
        reviews: current.reviews.map((review) => review.id === reviewId ? { ...review, helpfulCount: data.helpfulCount } : review),
      }));
    } catch (error) { toast.error(error.message); }
  }

  async function reportReview(reviewId) {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    const reason = window.prompt("Why should FlexHub review this feedback?");
    if (!reason) return;
    try {
      const data = await apiRequest(`/api/reviews/${reviewId}/report`, {
        method: "POST", token, body: JSON.stringify({ reason }),
      });
      toast.success(data.message);
    } catch (error) { toast.error(error.message); }
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-10 text-slate-900 sm:py-14">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-6">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1fr)_390px] xl:items-start">
            <div className="xl:sticky xl:top-28">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <img src={product.image} alt={product.name} decoding="async" className="aspect-square w-full rounded-2xl object-contain" />
              </div>
              {product.videoUrl && (
                <a href="#flexproof" className="mt-4 flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 p-4 font-bold text-violet-800">
                  <span className="flex items-center gap-2"><Film size={19} />Product video available</span>
                  <span className="text-sm">Watch ↓</span>
                </a>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-700">{product.category}</span>
                {product.trust?.productVerified && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-black text-emerald-700"><BadgeCheck size={17} />FlexHub Verified</span>}
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{product.name}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-600"><Star size={18} className={product.rating ? "fill-amber-400" : ""} />{product.rating ? `${product.rating} (${product.reviewCount} verified)` : "New listing"}</span>
                <span className={stock > 0 ? "font-bold text-green-600" : "font-bold text-red-500"}>{stock > 0 ? `${stock} in stock` : "Sold out"}</span>
              </div>

              <div className="mt-7 flex flex-wrap items-baseline gap-4">
                <h2 className="text-4xl font-black text-orange-600">₦{price.toLocaleString()}</h2>
                {oldPrice > 0 && <span className="text-xl text-slate-400 line-through">₦{oldPrice.toLocaleString()}</span>}
              </div>

              <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sold by</p>
                <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link to={`/stores/${product.storeId}`} className="flex items-center gap-2 text-lg font-black text-slate-950 hover:text-orange-600"><Store size={19} className="text-orange-500" />{product.storeName}</Link>
                    <span className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15} />{product.storeLocation || "Nigeria"}</span>
                  </div>
                  <SellerTrustBadge sellerTrust={product.sellerTrust} />
                </div>
              </div>

              <div className="mt-7">
                <h2 className="text-lg font-black">About this product</h2>
                <p className="mt-3 whitespace-pre-line leading-8 text-slate-600">{product.description}</p>
              </div>

              <div className="mt-8 flex items-end gap-4">
                <div><label className="mb-2 block text-sm font-bold">Quantity</label><div className="flex items-center rounded-xl border border-slate-300 bg-white"><button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} className="h-12 w-12 text-xl disabled:opacity-30">−</button><span className="w-10 text-center text-lg font-black">{quantity}</span><button type="button" onClick={() => setQuantity((current) => Math.min(current + 1, stock))} disabled={stock < 1 || quantity >= stock} className="h-12 w-12 text-xl disabled:opacity-30">+</button></div></div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={addItemToCart} disabled={stock < 1} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 font-black text-white hover:bg-orange-600 disabled:bg-slate-400"><ShoppingCart size={20} />Add to cart</button>
                <button type="button" onClick={buyNow} disabled={stock < 1} className="rounded-xl bg-slate-950 px-6 py-4 font-black text-white hover:bg-slate-800 disabled:bg-slate-400">Buy now</button>
              </div>
            </div>

            <div className="xl:sticky xl:top-28"><ProductTrustCard product={product} /></div>
          </div>

          {product.videoUrl && (
            <section id="flexproof" className="mt-14 scroll-mt-28 overflow-hidden rounded-3xl bg-slate-950 text-white">
              <div className="grid lg:grid-cols-[360px_1fr]">
                <div className="p-7 sm:p-9"><span className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1.5 text-sm font-black text-violet-200"><Film size={16} />FlexProof</span><h2 className="mt-5 text-3xl font-black">See the product before ordering</h2><p className="mt-4 leading-7 text-slate-300">This seller submitted a product video showing the item and its condition.</p><p className={`mt-5 rounded-xl p-4 text-sm font-bold ${product.trust?.flexProofVerified ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"}`}>{product.trust?.flexProofVerified ? "FlexHub reviewed this video against the listing." : "This video is seller-provided and has not been independently verified by FlexHub."}</p></div>
                <div className="bg-black"><video src={product.videoUrl} controls preload="metadata" className="max-h-[620px] h-full w-full object-contain" /></div>
              </div>
            </section>
          )}

          <section className="mt-14 grid gap-7 lg:grid-cols-[1fr_420px] lg:items-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">FlexReview</p><h2 className="mt-2 text-3xl font-black">Verified-purchase reviews</h2></div><span className="font-bold text-slate-500">{product.reviewCount || 0} review{product.reviewCount === 1 ? "" : "s"}</span></div>
              {product.reviews?.length > 0 ? <div className="mt-7 grid gap-4">{product.reviews.map((review) => <article key={review.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{review.customerName}</p><span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><BadgeCheck size={14} />Verified purchase</span></div><span className="font-black text-amber-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div>{review.comment && <p className="mt-4 leading-7 text-slate-600">{review.comment}</p>}<p className="mt-3 text-sm font-semibold text-slate-500">Matched description: {review.matchedDescription ? "Yes" : "No"}</p>{review.sellerReply && <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-orange-600">Seller response</p><p className="mt-2 leading-6 text-slate-700">{review.sellerReply.message}</p></div>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => toggleHelpful(review.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:border-orange-300"><ThumbsUp size={14} />Helpful ({review.helpfulCount || 0})</button><button type="button" onClick={() => reportReview(review.id)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"><Flag size={14} />Report</button></div></article>)}</div> : <div className="mt-7 rounded-2xl bg-slate-50 p-9 text-center text-slate-500">No verified buyer has reviewed this product yet.</div>}
            </div>

            <form onSubmit={submitReview} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-black">Review a delivered order</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">The server will publish this only if your account has a completed FlexHub order for this product.</p>
              {[["rating", "Product rating"], ["sellerRating", "Seller rating"], ["deliveryRating", "Delivery rating"]].map(([name, label]) => <label key={name} className="mt-4 grid gap-2 text-sm font-bold">{label}<select name={name} defaultValue="5" className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}</select></label>)}
              <label className="mt-4 grid gap-2 text-sm font-bold">Did it match the listing?<select name="matchedDescription" defaultValue="yes" className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal"><option value="yes">Yes</option><option value="no">No</option></select></label>
              <label className="mt-4 grid gap-2 text-sm font-bold">Your review<textarea name="comment" rows="4" maxLength="1000" className="rounded-xl border border-slate-300 px-3 py-3 font-normal leading-6" placeholder="What should other buyers know?" /></label>
              <button disabled={reviewBusy} className="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-black text-white disabled:opacity-50">{reviewBusy ? "Checking order…" : isAuthenticated ? "Publish verified review" : "Log in to review"}</button>
            </form>
          </section>
        </div>
      </section>
    </Layout>
  );
}

export default ProductDetails;
