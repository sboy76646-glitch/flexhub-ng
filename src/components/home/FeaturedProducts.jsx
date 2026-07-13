import products from "../../data/products";
import { Heart, ShoppingCart, Star } from "lucide-react";

function FeaturedProducts() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold text-white mb-10">
        Featured Products
      </h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition duration-300"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-60 w-full object-cover"
            />

            <div className="p-5">
              <p className="text-emerald-400 text-sm">
                {product.category}
              </p>

              <h3 className="text-xl font-semibold mt-2 text-white">
                {product.name}
              </h3>

              <div className="flex items-center mt-2">
                <Star
                  className="text-yellow-400 fill-yellow-400"
                  size={18}
                />
                <span className="ml-2 text-gray-300">
                  {product.rating}
                </span>
              </div>

              <div className="mt-4">
                <span className="text-2xl font-bold text-emerald-400">
                  ₦{product.price.toLocaleString()}
                </span>

                <span className="ml-3 line-through text-gray-500">
                  ₦{product.oldPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between mt-6">
                <button className="bg-emerald-500 hover:bg-emerald-600 rounded-xl p-3 transition">
                  <ShoppingCart size={20} />
                </button>

                <button className="border border-gray-600 hover:border-red-500 rounded-xl p-3 transition">
                  <Heart size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts; 