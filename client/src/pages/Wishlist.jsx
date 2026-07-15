import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function Wishlist() {
  const {
    wishlistItems,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-6">

          <h1 className="mb-10 text-5xl font-bold text-slate-950">
            ❤️ My Wishlist
          </h1>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-20">

              <Heart
                size={80}
                className="mx-auto text-gray-600 mb-6"
              />

              <h2 className="text-3xl font-bold text-slate-950">
                Your Wishlist is Empty
              </h2>

              <p className="mb-8 mt-4 text-slate-600">
                Save products you love and they'll appear here.
              </p>

              <Link
                to="/shop"
                className="rounded-xl bg-orange-500 px-8 py-4 text-white transition hover:bg-orange-600"
              >
                Continue Shopping
              </Link>

            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />

                  <div className="p-6">

                    <h2 className="text-2xl font-bold text-slate-950">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-slate-600">
                      {product.category}
                    </p>

                    <p className="mt-4 text-2xl font-bold text-orange-600">
                      ₦{product.price.toLocaleString()}
                    </p>

                    <div className="flex gap-3 mt-6">

                      <button
                        onClick={() => addToCart(product)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-white hover:bg-orange-600"
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
    </Layout>
  );
}

export default Wishlist;
