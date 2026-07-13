import { Heart, ShoppingCart, Star } from "lucide-react";

function ProductCard({ product }) {
  return (
    <div className="group bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-2 transition-all duration-300">

      {/* Product Image */}
      <div className="relative">

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
        />

        <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
          -{product.discount}%
        </span>

        <button className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-red-500 hover:text-white transition">
          <Heart size={18} />
        </button>

      </div>

      {/* Product Info */}

      <div className="p-5">

        <h3 className="text-white text-lg font-semibold">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-3 text-yellow-400">

          <Star fill="currentColor" size={16}/>
          <Star fill="currentColor" size={16}/>
          <Star fill="currentColor" size={16}/>
          <Star fill="currentColor" size={16}/>
          <Star fill="currentColor" size={16}/>

          <span className="text-gray-400 ml-2">
            ({product.rating})
          </span>

        </div>

        <div className="mt-4">

          <span className="text-emerald-400 text-2xl font-bold">
            ₦{product.price}
          </span>

          <span className="text-gray-500 line-through ml-3">
            ₦{product.oldPrice}
          </span>

        </div>

        <button className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 transition py-3 rounded-xl flex justify-center items-center gap-2 font-semibold">

          <ShoppingCart size={18}/>

          Add to Cart

        </button>

      </div>

    </div>
  );
}

export default ProductCard; 