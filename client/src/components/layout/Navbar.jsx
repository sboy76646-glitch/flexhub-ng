import { Heart, LogOut, Menu, Search, ShoppingCart, Store, User, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { BrandLogo } from "../brand/Brand";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const navItems = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Mini-stores", "/stores"],
  ["Sell", "/sell"],
];

function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const hasSellerWorkspace = ["seller", "seller_pending"].includes(user?.role);

  function handleSearch(event) {
    event.preventDefault();
    const query = search.trim();
    setMenuOpen(false);
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }

  const navClass = ({ isActive }) =>
    `transition hover:text-orange-400 ${isActive ? "text-orange-400" : "text-slate-300"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 shadow-lg backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center gap-4">
          <Link to="/" className="shrink-0" aria-label="FlexHub NG marketplace home">
            <BrandLogo textClassName="hidden text-xl sm:inline-flex" />
          </Link>

          <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 items-center rounded-xl border border-slate-800 bg-slate-900 px-4 focus-within:border-orange-500 md:flex lg:max-w-md">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" aria-label="Search marketplace" placeholder="Search products or stores" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500" />
          </form>

          <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold lg:flex" aria-label="Main navigation">
            {navItems.map(([label, path]) => <NavLink key={path} to={path} className={navClass}>{label}</NavLink>)}
            {hasSellerWorkspace && <NavLink to="/seller" className={navClass}>Seller dashboard</NavLink>}
            {user?.role === "admin" && <NavLink to="/admin/marketplace" className={navClass}>Admin</NavLink>}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3 lg:ml-2">
            <Link to="/wishlist" aria-label={`Wishlist with ${wishlistCount} items`} className="relative rounded-lg p-2 text-white transition hover:bg-slate-800 hover:text-orange-400">
              <Heart size={21} />
              {wishlistCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" aria-label={`Cart with ${cartCount} items`} className="relative rounded-lg p-2 text-white transition hover:bg-slate-800 hover:text-orange-400">
              <ShoppingCart size={21} />
              {cartCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{cartCount}</span>}
            </Link>

            {user ? (
              <>
                <Link to="/profile" aria-label="Your account" className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-bold text-white">{user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}</Link>
                <button type="button" onClick={logout} aria-label="Log out" className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400 sm:block"><LogOut size={20} /></button>
              </>
            ) : (
              <Link to="/login" aria-label="Log in" className="rounded-lg p-2 text-white transition hover:bg-slate-800 hover:text-orange-400 sm:hidden"><User size={21} /></Link>
            )}

            {!user && <Link to="/register" className="hidden rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 sm:inline-flex">Create account</Link>}
            <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Toggle navigation" className="rounded-lg p-2 text-white hover:bg-slate-800 lg:hidden">{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-800 py-4 lg:hidden">
            <form onSubmit={handleSearch} className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-4 md:hidden">
              <Search size={18} className="text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search products or stores" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-white outline-none" />
            </form>
            <nav className="mt-3 grid gap-1" aria-label="Mobile navigation">
              {navItems.map(([label, path]) => <NavLink key={path} to={path} onClick={() => setMenuOpen(false)} className={({ isActive }) => `rounded-xl px-4 py-3 font-semibold ${isActive ? "bg-orange-500/10 text-orange-400" : "text-slate-300 hover:bg-slate-900"}`}>{label}</NavLink>)}
              {hasSellerWorkspace && <NavLink to="/seller" onClick={() => setMenuOpen(false)} className={({ isActive }) => `rounded-xl px-4 py-3 font-semibold ${isActive ? "bg-orange-500/10 text-orange-400" : "text-slate-300 hover:bg-slate-900"}`}>Seller dashboard</NavLink>}
              {user?.role === "admin" && <NavLink to="/admin/marketplace" onClick={() => setMenuOpen(false)} className={({ isActive }) => `rounded-xl px-4 py-3 font-semibold ${isActive ? "bg-orange-500/10 text-orange-400" : "text-slate-300 hover:bg-slate-900"}`}>Marketplace admin</NavLink>}
              {user ? <button type="button" onClick={logout} className="flex items-center gap-2 rounded-xl px-4 py-3 text-left font-semibold text-red-400 hover:bg-slate-900"><LogOut size={18} />Log out</button> : <Link to="/login" className="rounded-xl px-4 py-3 font-semibold text-slate-300 hover:bg-slate-900">Log in</Link>}
            </nav>
            <Link to={hasSellerWorkspace ? "/seller" : "/sell"} className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-orange-500 px-4 py-3 font-bold text-orange-400"><Store size={18} />{hasSellerWorkspace ? "Open seller workspace" : "Open a mini-store"}</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
