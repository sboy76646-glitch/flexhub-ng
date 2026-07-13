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
        <h1 className="text-3xl font-bold text-emerald-400 cursor-pointer">
          FlexHub NG
        </h1>

        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-900 rounded-xl px-4 py-2 w-[350px]">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none ml-3 w-full text-white"
          />
        </div>

        {/* Navigation */}
        <div className="hidden lg:flex gap-8 text-gray-300">
          <a href="#" className="hover:text-emerald-400">Home</a>
          <a href="#" className="hover:text-emerald-400">Shop</a>
          <a href="#" className="hover:text-emerald-400">Categories</a>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">

          <Heart className="cursor-pointer hover:text-red-500 transition" />

          <ShoppingCart className="cursor-pointer hover:text-emerald-400 transition" />

          <User className="cursor-pointer hover:text-emerald-400 transition" />

        </div>

      </div>
    </nav>
  );
}

export default Navbar; 