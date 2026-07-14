import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
} from "lucide-react";

import { Link } from "react-router-dom";

import logo from "../../assets/logo/logo.png";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

function Navbar({ search = "", setSearch = () => {} }) {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex max-w-375 items-center justify-between gap-6 px-6 py-4">

        {/* Brand */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
        >
          <img
            src={logo}
            alt="FlexHub NG"
            className="h-20 w-20 object-contain drop-shadow-[0_0_16px_rgba(249,115,22,0.3)]"
          />

          <div className="hidden leading-none sm:block">
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-white">FLEX</span>
              <span className="text-orange-500">HUB</span>
            </h1>

            <p className="mt-2 text-[11px] font-semibold tracking-[0.55em] text-gray-400">
              NG
            </p>
          </div>
        </Link>

        {/* Search */}
        <div className="hidden w-full max-w-107.5 items-center rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 transition focus-within:border-orange-500 md:flex">
          <Search
            size={19}
            className="shrink-0 text-gray-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="text"
            placeholder="Search products..."
            className="ml-3 w-full bg-transparent text-white outline-none placeholder:text-gray-500"
          />
        </div>

        {/* Navigation */}
        <div className="hidden items-center gap-8 font-semibold lg:flex">
          <Link
            to="/"
            className="text-gray-300 transition hover:text-orange-500"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="text-gray-300 transition hover:text-orange-500"
          >
            Shop
          </Link>

          <Link
            to="/shop"
            className="text-gray-300 transition hover:text-orange-500"
          >
            Categories
          </Link>

          <Link
            to="/shop"
            className="text-gray-300 transition hover:text-orange-500"
          >
            Deals
          </Link>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-5">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative"
          >
            <Heart className="text-white transition hover:text-orange-500" />

            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="relative"
          >
            <ShoppingCart className="text-white transition hover:text-orange-500" />

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                aria-label="Profile"
                className="flex items-center gap-2"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20">
                  {user.firstName?.charAt(0) ||
                    user.name?.charAt(0) ||
                    "U"}
                </div>
              </Link>

              <button
                type="button"
                onClick={logout}
                aria-label="Logout"
              >
                <LogOut className="text-gray-400 transition hover:text-red-500" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="hidden font-semibold text-white transition hover:text-orange-500 sm:block"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                Register
              </Link>

              <Link
                to="/login"
                aria-label="Account"
                className="text-white transition hover:text-orange-500 sm:hidden"
              >
                <User size={22} />
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar; 