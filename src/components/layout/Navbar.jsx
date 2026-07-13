import {
  Search,
  ShoppingCart,
  Heart,
  User,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

function Navbar({ search = "", setSearch = () => {} }) {

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800">

      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        <Link to="/">
          <h1 className="text-3xl font-bold text-emerald-400">
            FlexHub NG
          </h1>
        </Link>

        <div className="hidden md:flex items-center bg-slate-900 rounded-xl px-4 py-2 w-[350px]">

          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none ml-3 w-full text-white"
          />

        </div>

        <div className="hidden lg:flex gap-8 text-gray-300">

          <Link
            to="/"
            className="hover:text-emerald-400"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="hover:text-emerald-400"
          >
            Shop
          </Link>

          <Link
            to="/"
            className="hover:text-emerald-400"
          >
            Categories
          </Link>

        </div>

        <div className="flex items-center gap-5">

          <Link
            to="/wishlist"
            className="relative"
          >

            <Heart className="text-white hover:text-red-500 transition" />

            {wishlistCount > 0 && (

              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex justify-center items-center">

                {wishlistCount}

              </span>

            )}

          </Link>

          <Link
            to="/cart"
            className="relative"
          >

            <ShoppingCart className="text-white hover:text-emerald-400 transition" />

            {cartCount > 0 && (

              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex justify-center items-center">

                {cartCount}

              </span>

            )}

          </Link>

          <Link to="/profile">
            <User className="text-white hover:text-emerald-400 transition" />
          </Link>

        </div>

      </div>

    </nav>
  );
}

export default Navbar; 