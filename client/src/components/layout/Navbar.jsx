import {
  Bell,
  ChevronDown,
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
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const navItems = user
    ? [...publicNavItems, ["Sell on FlexHub", "/sell"]]
    : publicNavItems;

  function handleSearch(event) {
    event.preventDefault();
    const query = search.trim();
    setMenuOpen(false);
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }

  const navClass = ({ isActive }) =>
    `relative whitespace-nowrap py-5 text-sm font-semibold transition after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-orange-500 after:transition-transform hover:text-slate-950 hover:after:scale-x-100 ${
      isActive
        ? "text-slate-950 after:scale-x-100"
        : "text-slate-600"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-orange-50 text-orange-600"
        : "text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-[72px] items-center gap-3 sm:gap-5">
          <Link
            to="/"
            className="shrink-0"
            aria-label="FlexHub NG marketplace home"
          >
            <BrandLogo textClassName="hidden text-xl sm:inline-flex" />
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 md:flex lg:max-w-xl"
          >
            <Search size={19} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              aria-label="Search marketplace"
              placeholder="Search phones, laptops, fashion, gaming..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="hidden rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-500 lg:block"
            >
              Search
            </button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {user && (
              <Link
                to="/notifications"
                aria-label={`${unreadNotifications} unread notifications`}
                className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/wishlist"
              aria-label={`Wishlist with ${wishlistCount} items`}
              className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              aria-label={`Cart with ${cartCount} items`}
              className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                to="/profile"
                aria-label="Your account"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white ring-2 ring-orange-100 transition hover:ring-orange-200"
              >
                {user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label="Log in"
                className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
              >
                <User size={19} />
                <span>Log in</span>
              </Link>
            )}

            {!user && (
              <Link
                to="/register"
                className="hidden rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md sm:inline-flex"
              >
                Create account
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div className="hidden items-center justify-between border-t border-slate-100 lg:flex">
          <nav className="flex items-center gap-7" aria-label="Main navigation">
            {navItems.map(([label, path]) => (
              <NavLink key={`${label}-${path}`} to={path} className={navClass}>
                {label}
              </NavLink>
            ))}
            {hasSellerWorkspace && (
              <NavLink to="/seller" className={navClass}>
                Seller Dashboard
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin/marketplace" className={navClass}>
                Admin
              </NavLink>
            )}
          </nav>

          {user ? (
            <div className="flex items-center gap-3 py-2">
              <Link
                to={hasSellerWorkspace ? "/seller" : "/sell"}
                className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
              >
                <Store size={15} />
                {hasSellerWorkspace ? "My Store" : "Create a Mini Store"}
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
              Shop with confidence <ChevronDown size={13} />
            </span>
          )}
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 py-4 lg:hidden">
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 md:hidden"
            >
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search products or stores"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </form>

            <nav className="mt-3 grid gap-1" aria-label="Mobile navigation">
              {navItems.map(([label, path]) => (
                <NavLink
                  key={`${label}-${path}`}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={mobileNavClass}
                >
                  {label}
                </NavLink>
              ))}

              {hasSellerWorkspace && (
                <NavLink
                  to="/seller"
                  onClick={() => setMenuOpen(false)}
                  className={mobileNavClass}
                >
                  Seller Dashboard
                </NavLink>
              )}

              {user?.role === "admin" && (
                <NavLink
                  to="/admin/marketplace"
                  onClick={() => setMenuOpen(false)}
                  className={mobileNavClass}
                >
                  Marketplace Admin
                </NavLink>
              )}

              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log in
                </Link>
              )}
            </nav>

            {user && (
              <Link
                to={hasSellerWorkspace ? "/seller" : "/sell"}
                onClick={() => setMenuOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
              >
                <Store size={18} />
                {hasSellerWorkspace ? "Open seller workspace" : "Create a mini-store"}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
