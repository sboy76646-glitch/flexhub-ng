function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-24">
      <h2 className="text-6xl font-extrabold leading-tight">
        Shop Smart.
        <br />
        Shop with confidence.
      </h2>

      <p className="mt-6 max-w-2xl text-xl text-slate-600">
        Premium gadgets, sneakers, fashion and accessories delivered across
        Nigeria.
      </p>

      <div className="mt-10 flex gap-5">
        <button className="rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition hover:bg-orange-600">
          Shop Now
        </button>

        <button className="rounded-xl border border-slate-300 bg-white px-8 py-4 text-slate-950 transition hover:border-orange-500 hover:text-orange-600">
          Explore
        </button>
      </div>
    </section>
  );
}

export default Hero;
