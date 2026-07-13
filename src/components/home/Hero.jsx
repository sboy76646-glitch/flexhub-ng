function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-24">
      <h2 className="text-6xl font-extrabold leading-tight">
        Shop Smart.
        <br />
        Shop FlexHub.
      </h2>

      <p className="mt-6 max-w-2xl text-xl text-gray-400">
        Premium gadgets, sneakers, fashion and accessories delivered across
        Nigeria.
      </p>

      <div className="mt-10 flex gap-5">
        <button className="rounded-xl bg-emerald-500 px-8 py-4 font-semibold hover:bg-emerald-600 transition">
          Shop Now
        </button>

        <button className="rounded-xl border border-white px-8 py-4 hover:bg-white hover:text-black transition">
          Explore
        </button>
      </div>
    </section>
  );
}

export default Hero; 