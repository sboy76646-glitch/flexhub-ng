import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-20">

      {/* Features */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

          <div className="text-center">
            <div className="text-4xl mb-3">🚚</div>
            <h3 className="text-white font-semibold">
              Nationwide Delivery
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              Fast delivery across Nigeria.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-white font-semibold">
              Secure Shopping
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              Safe payments and trusted products.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">💳</div>
            <h3 className="text-white font-semibold">
              Easy Payments
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              Bank transfer and Paystack supported.
            </p>
          </div>

        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand */}
        <div>

          <div className="flex items-center gap-3">
            <ShoppingBag
              size={34}
              className="text-emerald-400"
            />

            <h2 className="text-3xl font-bold text-emerald-400">
              FlexHub NG
            </h2>
          </div>

          <p className="text-gray-400 mt-6 leading-7">
            Nigeria's premium online marketplace for gadgets,
            fashion, accessories and electronics.
          </p>

        </div>

        {/* Shop */}
        <div>

          <h3 className="text-white text-xl font-bold mb-5">
            Shop
          </h3>

          <ul className="space-y-3 text-gray-400">

            <li className="hover:text-emerald-400 cursor-pointer">
              Smartphones
            </li>

            <li className="hover:text-emerald-400 cursor-pointer">
              Laptops
            </li>

            <li className="hover:text-emerald-400 cursor-pointer">
              Sneakers
            </li>

            <li className="hover:text-emerald-400 cursor-pointer">
              Gaming
            </li>

            <li className="hover:text-emerald-400 cursor-pointer">
              Accessories
            </li>

          </ul>

        </div>

        {/* Support */}
        <div>

          <h3 className="text-white text-xl font-bold mb-5">
            Support
          </h3>

          <ul className="space-y-3 text-gray-400">

            <li className="hover:text-emerald-400 cursor-pointer">
              Help Center
            </li>

            <li className="hover:text-emerald-400 cursor-pointer">
              Track Order
            </li>

            <li className="hover:text-emerald-400 cursor-pointer">
              Returns
            </li>

            <li className="hover:text-emerald-400 cursor-pointer">
              Privacy Policy
            </li>

            <li className="hover:text-emerald-400 cursor-pointer">
              Terms & Conditions
            </li>

          </ul>

        </div>

        {/* Contact */}
        <div>

          <h3 className="text-white text-xl font-bold mb-5">
            Contact
          </h3>

          <div className="space-y-5 text-gray-400">

            <div className="flex items-center gap-3">
              <MapPin
                size={18}
                className="text-emerald-400"
              />
              <span>Lagos, Nigeria</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone
                size={18}
                className="text-emerald-400"
              />
              <a
                href="tel:+2349113393303"
                className="hover:text-emerald-400"
              >
                0911 339 3303
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Mail
                size={18}
                className="text-emerald-400"
              />
              <a
                href="mailto:danny.olidean@gmail.com"
                className="hover:text-emerald-400"
              >
                danny.olidean@gmail.com
              </a>
            </div>

          </div>

          <div className="mt-8">

            <h4 className="text-white font-semibold mb-3">
              Subscribe to our Newsletter
            </h4>

            <div className="flex">

              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-l-xl outline-none"
              />

              <button className="bg-emerald-500 hover:bg-emerald-600 px-5 rounded-r-xl text-white font-semibold">
                Join
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800">

        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center">

          <p className="text-gray-500 text-sm">
            © 2026 FlexHub NG. All rights reserved.
          </p>

          <p className="text-gray-500 text-sm mt-3 md:mt-0">
            Built with ❤️ in Nigeria.
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer; 