import {
  BadgeCheck,
  Eye,
  Heart,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const liked = isInWishlist(product.id);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) /
            product.oldPrice) *
            100
        )
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
    <article className="product-card">
      <div className="relative h-64 shrink-0 overflow-hidden bg-slate-950">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image h-full w-full object-cover"
          />
        </Link>

        {discount > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-black text-white shadow-lg">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/90 text-white backdrop-blur transition hover:scale-110 hover:bg-white hover:text-red-500"
        >
          <Heart
            size={21}
            className={
              liked
                ? "fill-red-500 text-red-500"
                : ""
            }
          />
        </button>

        <Link
          to={`/product/${product.id}`}
          className="product-quick-view absolute bottom-4 left-1/2 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg"
        >
          <Eye size={17} />
          Quick View
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-orange-400">
              {product.category}
            </p>

            <Link to={`/product/${product.id}`}>
              <h3 className="mt-2 min-h-[56px] text-xl font-black leading-7 text-white transition-colors hover:text-orange-400">
                {product.name}
              </h3>
            </Link>
          </div>

          <BadgeCheck
            size={22}
            className="shrink-0 text-orange-400"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Star
              size={17}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="font-semibold text-white">
              {product.rating}
            </span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Truck
              size={16}
              className="text-orange-400"
            />

            Fast delivery
          </div>
        </div>

        <div className="mt-6 min-h-[76px]">
          <span className="block text-3xl font-black text-orange-400">
            ₦{product.price.toLocaleString()}
          </span>

          <span
            className={`mt-2 block text-slate-500 line-through ${
              product.oldPrice ? "visible" : "invisible"
            }`}
          >
            ₦
            {product.oldPrice
              ? product.oldPrice.toLocaleString()
              : "0"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-1 hover:bg-orange-600 active:scale-95"
        >
          <ShoppingCart size={19} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard; 