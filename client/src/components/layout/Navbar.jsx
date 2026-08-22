import {
  Bell,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { BrandLogo } from "../brand/Brand";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { usePersonalization } from "../../context/PersonalizationContext";
import { apiRequest } from "../../lib/api";

const publicNavItems = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Categories", "/shop"],
  ["Flash Deals", "/shop?deal=flash"],
  ["Mini Stores", "/stores"],
];

function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout, token } = useAuth();
  const { recordSearch } = usePersonalization();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!token) {
      setUnreadNotifications(0);
      return undefined;
    }

    let cancelled = false;
    const load = () =>
      apiRequest("/api/notifications?limit=1", { token })
        .then((data) => {
          if (!cancelled) setUnreadNotifications(data.unreadCount || 0);
        })
        .catch(() => {});

    load();
    window.addEventListener("flexhub:notifications-updated", load);

    return () => {
      cancelled = true;
      window.removeEventListener("flexhub:notifications-updated", load);
    };
  }, [token]);

  const hasSellerWorkspace = ["seller", "seller_pending"].includes(user?.role);

  function handleSearch(event) {
    event.preventDefault();
    const query = search.trim();
    if (query) recordSearch(query);
    setMobileSearchOpen(false);
    setMenuOpen(false);
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }

  const mobileNavClass = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive ? "bg-orange-50 text-orange-600" : "text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-[58px] items-center gap-2 sm:min-h-[64px] sm:gap-4">
          <Link to="/" className="shrink-0" aria-label="FlexHub NG marketplace home">
            <BrandLogo theme="light" markClassName="h-8 w-8 sm:h-9 sm:w-9" textClassName="inline-flex text-sm sm:text-lg" />
          </Link>

          <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 md:flex lg:max-w-2xl">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" aria-label="Search marketplace" placeholder="Search phones, laptops, fashion, gaming..." className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <button type="submit" className="hidden rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-500 lg:block">Search</button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            <button type="button" onClick={() => setMobileSearchOpen((value) => !value)} aria-expanded={mobileSearchOpen} aria-label={mobileSearchOpen ? "Close search" : "Search FlexHub NG"} className="rounded-xl p-2 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 md:hidden">
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {user && (
              <Link to="/notifications" aria-label={`${unreadNotifications} unread notifications`} className="relative hidden rounded-xl p-2 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 sm:block">
                <Bell size={19} />
                {unreadNotifications > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
              </Link>
            )}

            <Link to="/wishlist" aria-label={`Wishlist with ${wishlistCount} items`} className="relative rounded-xl p-2 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{wishlistCount}</span>}
            </Link>

            <Link to="/cart" aria-label={`Cart with ${cartCount} items`} className="relative rounded-xl p-2 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{cartCount}</span>}
            </Link>

            {user ? (
              <Link to="/profile" aria-label="Your account" className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white ring-2 ring-orange-100 transition hover:ring-orange-200">
                {user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}
              </Link>
            ) : (
              <Link to="/login" aria-label="Log in" className="hidden items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex">
                <User size={18} />
                <span>Log in</span>
              </Link>
            )}

            {!user && <Link to="/register" className="hidden rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md sm:inline-flex">Create account</Link>}

            {user && (
              <Link to={hasSellerWorkspace ? "/seller" : "/sell"} className="hidden items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100 lg:inline-flex">
                <Store size={14} />
                {hasSellerWorkspace ? "My Store" : "Sell"}
              </Link>
            )}

            <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Toggle navigation" className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden">
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="border-t border-slate-100 py-3 md:hidden">
            <form onSubmit={handleSearch} className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} type="search" aria-label="Search marketplace" placeholder="Search phones, laptops, fashion..." className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <button type="submit" className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white">Search</button>
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="border-t border-slate-100 py-4 lg:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {publicNavItems.map(([label, path]) => <NavLink key={`${label}-${path}`} to={path} onClick={() => setMenuOpen(false)} className={mobileNavClass}>{label}</NavLink>)}
              {user && <NavLink to={hasSellerWorkspace ? "/seller" : "/sell"} onClick={() => setMenuOpen(false)} className={mobileNavClass}>{hasSellerWorkspace ? "My Store" : "Sell on FlexHub"}</NavLink>}
              {user?.role === "admin" && <NavLink to="/admin/marketplace" onClick={() => setMenuOpen(false)} className={mobileNavClass}>Marketplace Admin</NavLink>}
              {user ? <button type="button" onClick={logout} className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50"><LogOut size={18} /> Log out</button> : <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Log in</Link>}
            </nav>
          </div>
        )}
      </div>
      <div aria-hidden="true" className="h-1 bg-black" />
    </header>
  );
}

export default Navbar;
