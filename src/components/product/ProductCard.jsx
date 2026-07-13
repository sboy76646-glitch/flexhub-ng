import { Heart, ShoppingCart, Star } from "lucide-react";
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

  const toggleWishlist = () => {
    if (liked) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition duration-300">

      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="h-60 w-full object-cover"
        />
      </Link>

      <div className="p-5">

        <div className="flex justify-between items-start">

          <div>
            <p className="text-emerald-400 text-sm">
              {product.category}
            </p>

            <h3 className="text-white text-xl font-bold mt-1">
              {product.name}
            </h3>
          </div>

          <button onClick={toggleWishlist}>
            <Heart
              size={22}
              className={`transition ${
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-white hover:text-red-500"
              }`}
            />
          </button>

        </div>

        <div className="flex items-center mt-3 gap-1">

          <Star
            size={16}
            className="fill-yellow-400 text-yellow-400"
          />

          <span className="text-gray-300">
            {product.rating}
          </span>

        </div>

        <div className="flex items-center gap-3 mt-4">

          <span className="text-emerald-400 text-2xl font-bold">
            ₦{product.price.toLocaleString()}
          </span>

          <span className="text-gray-500 line-through">
            ₦{product.oldPrice.toLocaleString()}
          </span>

        </div>

        <button
          onClick={() => addToCart(product)}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>

      </div>
    </div>
  );
}

export default ProductCard; 