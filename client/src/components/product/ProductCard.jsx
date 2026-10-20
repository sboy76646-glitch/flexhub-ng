import { Heart, ShoppingCart, Star, X, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { usePersonalization } from "../../context/PersonalizationContext";
import { apiRequest } from "../../lib/api";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, token } = useAuth();
  const { recordProductView } = usePersonalization();
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const availableSizes = Array.isArray(product.sizes) ? product.sizes.filter((size) => Number(size.stock) > 0) : [];
  const selectedSizeStock = availableSizes.find((size) => size.label === selectedSize)?.stock || 0;

  const liked = isInWishlist(product.id);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);
  const stock = Number(product.stock || 0);

  function toggleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();
    if (liked) removeFromWishlist(product.id);
    else addToWishlist(product);
  }

  function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    if (stock > 0) {
      if (product.hasSizes && availableSizes.length > 0) { setSelectedSize(availableSizes[0].label); setQuantity(1); setSizeModalOpen(true); }
      else if (!product.hasSizes) addToCart(product);
    }
  }

  function handleProductView() {
    recordProductView(product);
    if (isAuthenticated && token && product.id) {
      apiRequest("/api/recommendations/interactions", {
        method: "POST",
        token,
        timeout: 8000,
        body: JSON.stringify({ productId: product.id, type: "view" }),
      }).catch(() => {});
    }
  }

  return (
    <>
    <article className="product-card overflow-hidden">
      <Link to={`/product/${product.id}`} onClick={handleProductView} className="block h-36 overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 sm:h-44">
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="product-card-image h-full w-full object-cover" />
      </Link>

      <div className="flex flex-1 flex-col px-3 py-2.5 sm:px-3.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-orange-500">{product.category}</p>
          <button type="button" onClick={toggleWishlist} aria-label={liked ? "Remove from wishlist" : "Add to wishlist"} className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
            <Heart size={17} className={liked ? "fill-red-500 text-red-500" : ""} />
          </button>
        </div>

        <Link to={`/product/${product.id}`} onClick={handleProductView} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
          <h3 className="mt-0.5 min-h-[34px] line-clamp-2 text-[13px] font-black leading-[17px] text-slate-950 transition-colors hover:text-orange-600 sm:text-sm sm:leading-[18px]">{product.name}</h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1 text-[11px]">
          <Star size={13} className={product.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} />
          <span className="font-semibold text-slate-900">{product.rating || "New"}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
          <div className="min-w-0">
            <span className="block text-base font-black leading-none text-orange-600 sm:text-lg">₦{price.toLocaleString()}</span>
            {oldPrice > price && <span className="mt-0.5 block text-[10px] text-slate-400 line-through">₦{oldPrice.toLocaleString()}</span>}
          </div>
          <button type="button" onClick={handleAddToCart} disabled={stock < 1} aria-label={stock > 0 ? "Add to cart" : "Sold out"} title={stock > 0 ? "Add to cart" : "Sold out"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm transition-colors hover:bg-orange-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400">
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>

    </article>
    {sizeModalOpen && (
      <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSizeModalOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby={"size-dialog-" + product.id} className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-600">Choose your option</p><h2 id={"size-dialog-" + product.id} className="mt-1 text-xl font-black text-slate-950">{product.name}</h2><p className="mt-1 text-sm text-slate-500">Select a size before adding this item.</p></div><button type="button" onClick={() => setSizeModalOpen(false)} aria-label="Close size selector" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
          <div className="mt-5 grid grid-cols-4 gap-2">{(product.sizes || []).map((size) => { const inStock = Number(size.stock) > 0; const selected = selectedSize === size.label; return <button key={size.label} type="button" disabled={!inStock} onClick={() => { setSelectedSize(size.label); setQuantity(1); }} className={"rounded-xl border px-2 py-3 text-sm font-bold transition " + (selected ? "border-orange-500 bg-orange-500 text-white" : inStock ? "border-slate-200 text-slate-800 hover:border-orange-400" : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through")} aria-pressed={selected}>{size.label}{!inStock && <span className="block text-[9px] font-medium no-underline">Sold out</span>}</button>; })}</div>
          {selectedSize && <p className="mt-3 text-xs text-slate-500">{selectedSizeStock} available in size {selectedSize}</p>}
          <div className="mt-5 flex items-center justify-between"><span className="font-bold text-slate-700">Quantity</span><div className="flex items-center gap-3 rounded-xl border border-slate-200 p-1"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="rounded-lg p-2 hover:bg-slate-100"><Minus size={16} /></button><span className="min-w-5 text-center font-black">{quantity}</span><button type="button" aria-label="Increase quantity" disabled={quantity >= selectedSizeStock} onClick={() => setQuantity((value) => Math.min(selectedSizeStock, value + 1))} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30"><Plus size={16} /></button></div></div>
          <button type="button" disabled={!selectedSize || quantity < 1 || quantity > selectedSizeStock} onClick={() => { addToCart(product, quantity, selectedSize); setSizeModalOpen(false); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"><ShoppingCart size={18} />Add to cart · ₦{(price * quantity).toLocaleString("en-NG")}</button>
        </section>
      </div>
    )}
    </>
  );
}

export default ProductCard;
