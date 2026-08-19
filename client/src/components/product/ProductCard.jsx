import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const liked = isInWishlist(product.id);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);
  const stock = Number(product.stock || 0);

  const discount =
    oldPrice > price && price > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  function toggleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();

    if (liked) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }

  function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
  }

  return (
    <article className="product-card overflow-hidden">
      <div className="relative h-36 shrink-0 overflow-hidden bg-slate-100 sm:h-44">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="product-card-image h-full w-full object-cover"
          />
        </Link>

        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-orange-500 px-2 py-1 text-[11px] font-black text-white shadow-md">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:text-red-500"
        >
          <Heart
            size={18}
            className={liked ? "fill-red-500 text-red-500" : ""}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <p className="truncate text-[11px] font-semibold text-orange-500">
          {product.category}
        </p>

        <Link to={`/product/${product.id}`}>
          <h3 className="mt-1 min-h-[36px] line-clamp-2 text-sm font-black leading-[18px] text-slate-950 transition-colors hover:text-orange-600 sm:text-[15px] sm:leading-5">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star
            size={14}
            className={
              product.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300"
            }
          />
          <span className="font-semibold text-slate-900">
            {product.rating || "New"}
          </span>
        </div>

        <div className="mt-3 min-h-[46px]">
          <span className="block text-lg font-black text-orange-600 sm:text-xl">
            ₦{price.toLocaleString()}
          </span>

          {oldPrice > price && (
            <span className="mt-1 block text-xs text-slate-400 line-through">
              ₦{oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock < 1}
          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange-500 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <ShoppingCart size={16} />
          {stock > 0 ? "Add to Cart" : "Sold out"}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
