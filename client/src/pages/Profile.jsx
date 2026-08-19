import {
  LogOut,
  Mail,
  Phone,
  ShoppingBag,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { BrandMark } from "../components/brand/Brand";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const initials = `${user.firstName?.charAt(0) || ""}${
    user.lastName?.charAt(0) || ""
  }`;

  return (
    <Layout>
      <section className="relative min-h-screen overflow-hidden bg-slate-950 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_32rem)]" />

        <div className="relative mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95 shadow-2xl shadow-orange-500/10 backdrop-blur">

            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-950/60 p-8 md:p-12">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-500 text-3xl font-black text-white shadow-xl shadow-orange-500/25">
                      {initials || "U"}
                    </div>

                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-slate-950 bg-white">
                      <BrandMark className="h-5 w-5" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
                      Customer Profile
                    </p>

                    <h1 className="mt-2 text-4xl font-black text-white">
                      {user.name ||
                        `${user.firstName || ""} ${user.lastName || ""}`.trim()}
                    </h1>

                    <p className="mt-3 text-slate-400">
                      Manage your FlexHub NG account information.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-3 font-bold text-white shadow-lg shadow-red-500/15 transition hover:-translate-y-0.5 hover:bg-red-600"
                >
                  <LogOut size={19} />
                  Logout
                </button>
              </div>
            </div>

            {/* Profile details */}
            <div className="p-8 md:p-12">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-800/70 p-6">
                  <div className="flex items-center gap-3 text-orange-400">
                    <User size={20} />
                    <p className="text-sm font-bold uppercase tracking-[0.15em]">
                      First Name
                    </p>
                  </div>

                  <p className="mt-4 text-xl font-bold text-white">
                    {user.firstName || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/70 p-6">
                  <div className="flex items-center gap-3 text-orange-400">
                    <User size={20} />
                    <p className="text-sm font-bold uppercase tracking-[0.15em]">
                      Last Name
                    </p>
                  </div>

                  <p className="mt-4 text-xl font-bold text-white">
                    {user.lastName || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/70 p-6">
                  <div className="flex items-center gap-3 text-orange-400">
                    <Mail size={20} />
                    <p className="text-sm font-bold uppercase tracking-[0.15em]">
                      Email Address
                    </p>
                  </div>

                  <p className="mt-4 break-all text-xl font-bold text-white">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/70 p-6">
                  <div className="flex items-center gap-3 text-orange-400">
                    <Phone size={20} />
                    <p className="text-sm font-bold uppercase tracking-[0.15em]">
                      Phone Number
                    </p>
                  </div>

                  <p className="mt-4 text-xl font-bold text-white">
                    {user.phone || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 md:col-span-2">
                  <div className="flex items-center gap-3 text-orange-400">
                    <ShieldCheck size={21} />
                    <p className="text-sm font-bold uppercase tracking-[0.15em]">
                      Account Role
                    </p>
                  </div>

                  <p className="mt-4 text-xl font-bold capitalize text-orange-400">
                    {user.role || "customer"}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    This role controls the shopping, seller and admin tools available to your account.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to="/orders" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-slate-950 hover:bg-slate-100">
                      <ShoppingBag size={18} /> My orders
                    </Link>
                    <Link to="/seller" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white hover:bg-orange-600">
                      <Store size={18} /> Seller workspace
                    </Link>
                    {user.role === "admin" && (
                      <>
                        <Link to="/admin/marketplace" className="inline-flex items-center gap-2 rounded-xl border border-orange-500 px-4 py-3 font-bold text-orange-400 hover:bg-orange-500 hover:text-white">
                          Marketplace admin
                        </Link>
                        <Link to="/admin/stores" className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-3 font-bold text-slate-300 hover:border-orange-500 hover:text-orange-400">
                          Review mini-stores
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Profile;
