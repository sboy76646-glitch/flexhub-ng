import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

function Navbar({ search = "", setSearch = () => {} }) {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const { user, logout } = useAuth();

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
            className="hover:text-emerald-400 transition"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="hover:text-emerald-400 transition"
          >
            Shop
          </Link>

          <Link
            to="/"
            className="hover:text-emerald-400 transition"
          >
            Categories
          </Link>

        </div>

        <div className="flex items-center gap-5">

          {/* Wishlist */}

          <Link
            to="/wishlist"
            className="relative"
          >

            <Heart className="text-white hover:text-red-500 transition" />

            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {wishlistCount}
              </span>
            )}

          </Link>

          {/* Cart */}

          <Link
            to="/cart"
            className="relative"
          >

            <ShoppingCart className="text-white hover:text-emerald-400 transition" />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}

          </Link>

          {/* Authentication */}

          {user ? (

            <div className="flex items-center gap-3">

              <Link
                to="/profile"
                className="flex items-center gap-2 text-white hover:text-emerald-400 transition"
              >
                <User size={20} />
                <span className="hidden md:block">
                  {user.name}
                </span>
              </Link>

              <button
                onClick={logout}
                className="text-red-400 hover:text-red-500 transition"
              >
                <LogOut size={20} />
              </button>

            </div>

          ) : (

            <div className="flex items-center gap-3">

              <Link
                to="/login"
                className="text-white hover:text-emerald-400 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-white transition"
              >
                Register
              </Link>

            </div>

          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar; 