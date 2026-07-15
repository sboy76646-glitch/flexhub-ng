import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function Wishlist() {
  const {
    wishlistItems,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  return (
    <>
      <Navbar />

      <section className="bg-slate-950 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-6">

          <h1 className="text-5xl font-bold text-white mb-10">
            ❤️ My Wishlist
          </h1>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-20">

              <Heart
                size={80}
                className="mx-auto text-gray-600 mb-6"
              />

              <h2 className="text-3xl text-white font-bold">
                Your Wishlist is Empty
              </h2>

              <p className="text-gray-400 mt-4 mb-8">
                Save products you love and they'll appear here.
              </p>

              <Link
                to="/shop"
                className="bg-emerald-500 px-8 py-4 rounded-xl text-white hover:bg-emerald-600 transition"
              >
                Continue Shopping
              </Link>

            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900 rounded-2xl overflow-hidden"
                >

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />

                  <div className="p-6">

                    <h2 className="text-white text-2xl font-bold">
                      {product.name}
                    </h2>

                    <p className="text-gray-400 mt-2">
                      {product.category}
                    </p>

                    <p className="text-emerald-400 text-2xl font-bold mt-4">
                      ₦{product.price.toLocaleString()}
                    </p>

                    <div className="flex gap-3 mt-6">

                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>

                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-xl"
                      >
                        <Trash2 size={20} />
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default Wishlist; 