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
    if (stock > 0) addToCart(product);
  }

  return (
    <article className="product-card overflow-hidden">
      {/* Product image only */}
      <Link
        to={`/product/${product.id}`}
        className="block h-36 overflow-hidden bg-slate-100 sm:h-44"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="product-card-image h-full w-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[11px] font-semibold text-orange-500">
            {product.category}
          </p>

          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:text-red-500"
          >
            <Heart
              size={18}
              className={liked ? "fill-red-500 text-red-500" : ""}
            />
          </button>
        </div>

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

        {/* Price left, cart icon right */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0">
            <span className="block text-lg font-black leading-none text-orange-600 sm:text-xl">
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
            aria-label={stock > 0 ? "Add to cart" : "Sold out"}
            title={stock > 0 ? "Add to cart" : "Sold out"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
