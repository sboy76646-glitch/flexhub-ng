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
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

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
        <div className="hidden md:flex items-center bg-slate-900 rounded-xl px-4 py-2 w-87.5">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="bg-transparent outline-none ml-3 w-full text-white placeholder-gray-400"
          />
        </div>

        {/* Navigation */}
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

        {/* Icons */}
        <div className="flex items-center gap-5 text-white">

          {/* Wishlist */}
          <Link to="/wishlist" className="relative">
            <Heart
              size={22}
              className="cursor-pointer hover:text-red-500 transition"
            />

            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <ShoppingCart
              size={22}
              className="cursor-pointer hover:text-emerald-400 transition"
            />

            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link to="/profile">
            <User
              size={22}
              className="cursor-pointer hover:text-emerald-400 transition"
            />
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar; 