import {
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Link } from "react-router-dom";
import { BrandLogo } from "../brand/Brand";

function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950">

      {/* Trust features */}
      <div className="border-b border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">

          <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <Truck size={25} />
            </div>

            <div>
              <h3 className="font-bold text-white">
                Nationwide Delivery
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Fast delivery across Nigeria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <ShieldCheck size={25} />
            </div>

            <div>
              <h3 className="font-bold text-white">
                Secure Shopping
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Safe payments and trusted products.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <CreditCard size={25} />
            </div>

            <div>
              <h3 className="font-bold text-white">
                Easy Payments
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Bank transfer and Paystack supported.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-3"
          >
            <BrandLogo markClassName="h-14 w-14" textClassName="inline-flex text-2xl" />
          </Link>

          <p className="mt-6 leading-7 text-slate-400">
            A public marketplace where shoppers discover products and
            independent Nigerian businesses build their own mini-stores.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-orange-400">
            <ShoppingBag size={17} />
            Style. Tech. Lifestyle.
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="mb-5 text-xl font-bold text-white">
            Marketplace
          </h3>

          <ul className="space-y-3 text-slate-400">
            <li>
              <Link to="/stores" className="hover:text-orange-400">
                Browse Mini-stores
              </Link>
            </li>

            <li>
              <Link to="/sell" className="hover:text-orange-400">
                Sell on FlexHub NG
              </Link>
            </li>

            <li>
              <Link to="/shop" className="hover:text-orange-400">
                Smartphones
              </Link>
            </li>

            <li>
              <Link to="/shop" className="hover:text-orange-400">
                Laptops
              </Link>
            </li>

            <li>
              <Link to="/shop" className="hover:text-orange-400">
                Sneakers
              </Link>
            </li>

            <li>
              <Link to="/shop" className="hover:text-orange-400">
                Gaming
              </Link>
            </li>

            <li>
              <Link to="/shop" className="hover:text-orange-400">
                Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="mb-5 text-xl font-bold text-white">
            Support
          </h3>

          <ul className="space-y-3 text-slate-400">
            <li>
              <button
                type="button"
                className="hover:text-orange-400"
              >
                Help Center
              </button>
            </li>

            <li>
              <button
                type="button"
                className="hover:text-orange-400"
              >
                Track Order
              </button>
            </li>

            <li>
              <button
                type="button"
                className="hover:text-orange-400"
              >
                Returns
              </button>
            </li>

            <li>
              <button
                type="button"
                className="hover:text-orange-400"
              >
                Privacy Policy
              </button>
            </li>

            <li>
              <button
                type="button"
                className="hover:text-orange-400"
              >
                Terms & Conditions
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-5 text-xl font-bold text-white">
            Contact
          </h3>

          <div className="space-y-5 text-slate-400">
            <div className="flex items-center gap-3">
              <MapPin
                size={18}
                className="shrink-0 text-orange-400"
              />

              <span>Lagos, Nigeria</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone
                size={18}
                className="shrink-0 text-orange-400"
              />

              <a
                href="tel:+2349113393303"
                className="hover:text-orange-400"
              >
                0911 339 3303
              </a>
            </div>

            <div className="flex items-start gap-3">
              <Mail
                size={18}
                className="mt-1 shrink-0 text-orange-400"
              />

              <a
                href="mailto:danny.olidean@gmail.com"
                className="break-all hover:text-orange-400"
              >
                danny.olidean@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="mb-3 font-semibold text-white">
              Subscribe to our newsletter
            </h4>

            <div className="flex overflow-hidden rounded-xl border border-slate-800 bg-slate-900 focus-within:border-orange-500">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />

              <button
                type="button"
                className="bg-orange-500 px-5 font-semibold text-white hover:bg-orange-600"
              >
                Join
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row">

          <p className="text-sm text-slate-500">
            © 2026 FlexHub NG. All rights reserved.
          </p>

          <p className="text-sm text-slate-500">
            Built with ❤️ in Nigeria.
          </p>

        </div>
      </div>

    </footer>
  );
}

export default Footer;
