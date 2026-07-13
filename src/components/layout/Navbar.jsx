import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* Logo */}
        <h1 className="text-3xl font-extrabold tracking-tight cursor-pointer select-none">
          <span className="text-white">Flex</span>
          <span className="text-emerald-400">Hub</span>
          <span className="text-gray-400 text-xl ml-1">NG</span>
        </h1>

        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 w-105">

          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search for products..."
            className="bg-transparent outline-none ml-3 w-full text-white placeholder:text-gray-500"
          />

        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-gray-300 font-medium">

          <a href="#" className="hover:text-emerald-400 transition">
            Home
          </a>

          <a href="#" className="hover:text-emerald-400 transition">
            Shop
          </a>

          <a href="#" className="hover:text-emerald-400 transition">
            Categories
          </a>

          <a href="#" className="hover:text-emerald-400 transition">
            Deals
          </a>

        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">

          <button className="relative hover:text-red-500 transition">
            <Heart size={22} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5">
              0
            </span>
          </button>

          <button className="relative hover:text-emerald-400 transition">
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] rounded-full px-1.5">
              0
            </span>
          </button>

          <button className="hover:text-emerald-400 transition">
            <User size={22} />
          </button>

          {/* Mobile Menu Icon */}
          <button className="lg:hidden hover:text-emerald-400 transition">
            <Menu size={26} />
          </button>

        </div>

      </div>
    </nav>
  );
}

export default Navbar; 