import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* Logo */}
        <Link to="/">
          <h1 className="text-3xl font-bold text-emerald-400 cursor-pointer">
            FlexHub NG
          </h1>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-900 rounded-xl px-4 py-2 w-96">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none ml-3 w-full text-white"
          />
        </div>

        {/* Navigation */}
        <div className="hidden lg:flex gap-8 text-gray-300">
          <Link
            to="/"
            className="hover:text-emerald-400 transition duration-300"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="hover:text-emerald-400 transition duration-300"
          >
            Shop
          </Link>

          <Link
            to="/wishlist"
            className="hover:text-emerald-400 transition duration-300"
          >
            Wishlist
          </Link>

          <Link
            to="/cart"
            className="hover:text-emerald-400 transition duration-300"
          >
            Cart
          </Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">

          <Link to="/wishlist">
            <Heart className="cursor-pointer hover:text-red-500 transition duration-300" />
          </Link>

          <Link to="/cart">
            <ShoppingCart className="cursor-pointer hover:text-emerald-400 transition duration-300" />
          </Link>

          <Link to="/login">
            <User className="cursor-pointer hover:text-emerald-400 transition duration-300" />
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar; 