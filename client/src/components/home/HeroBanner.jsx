import heroImage from "../../assets/hero.png";

function HeroBanner() {
  return (
    <section className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Side */}

          <div>

            <span className="inline-block bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
              🔥 Nigeria's Fast Growing Marketplace
            </span>

            <h1 className="text-5xl lg:text-7xl font-extrabold mt-8 leading-tight">

              Shop
              <span className="text-emerald-400"> Smarter.</span>

              <br />

              Live Better.

            </h1>

            <p className="text-gray-400 mt-8 text-lg leading-8 max-w-xl">

              Discover premium fashion, gadgets, electronics,
              accessories and everyday essentials at unbeatable prices.

            </p>

            <div className="flex flex-wrap gap-5 mt-10">

              <button className="bg-emerald-500 hover:bg-emerald-600 transition px-8 py-4 rounded-xl font-semibold">

                Shop Now

              </button>

              <button className="border border-gray-600 hover:border-emerald-400 hover:text-emerald-400 transition px-8 py-4 rounded-xl font-semibold">

                Explore Deals

              </button>

            </div>

            <div className="grid grid-cols-3 gap-8 mt-14">

              <div>
                <h2 className="text-3xl font-bold text-emerald-400">
                  10K+
                </h2>

                <p className="text-gray-400">
                  Products
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-emerald-400">
                  5K+
                </h2>

                <p className="text-gray-400">
                  Customers
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-emerald-400">
                  500+
                </h2>

                <p className="text-gray-400">
                  Brands
                </p>
              </div>

            </div>

          </div>

          {/* Right Side */}

          <div className="flex justify-center">

            <img
              src={heroImage}
              alt="Hero"
              className="w-full max-w-lg drop-shadow-2xl"
            />

          </div>

        </div>

      </div>
    </section>
  );
}

export default HeroBanner; 