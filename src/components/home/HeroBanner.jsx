import { ArrowRight } from "lucide-react";

function HeroBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl overflow-hidden">

        <div className="grid lg:grid-cols-2 items-center gap-10 p-12">

          <div>

            <p className="uppercase tracking-widest text-white/80 mb-4">
              New Collection 2026
            </p>

            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
              Shop Smarter.
              <br />
              Live Better.
            </h1>

            <p className="text-lg text-white/80 mt-6">
              Premium gadgets, fashion, sneakers and accessories
              delivered across Nigeria.
            </p>

            <div className="flex gap-5 mt-10">

              <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:scale-105 transition">
                Shop Now
              </button>

              <button className="border border-white px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-white hover:text-emerald-600 transition">
                Explore
                <ArrowRight size={18}/>
              </button>

            </div>

          </div>

          <div className="hidden lg:flex justify-center">

            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900"
              alt="Phone"
              className="rounded-3xl shadow-2xl"
            />

          </div>

        </div>

      </div>
    </section>
  );
}

export default HeroBanner; 