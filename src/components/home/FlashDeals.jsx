const deals = [
  {
    id: 1,
    name: "Nike Air Max",
    price: "₦65,000",
    oldPrice: "₦80,000",
    discount: "-19%",
  },
  {
    id: 2,
    name: "Apple AirPods Pro",
    price: "₦180,000",
    oldPrice: "₦220,000",
    discount: "-18%",
  },
  {
    id: 3,
    name: "PlayStation 5",
    price: "₦950,000",
    oldPrice: "₦1,050,000",
    discount: "-10%",
  },
];

function FlashDeals() {
  return (
    <section className="bg-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-bold text-white">
            🔥 Flash Deals
          </h2>

          <button className="text-emerald-400 hover:underline">
            View All →
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {deals.map((deal) => (

            <div
              key={deal.id}
              className="bg-slate-800 rounded-2xl p-6 hover:scale-105 transition duration-300 shadow-lg"
            >

              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                {deal.discount}
              </span>

              <div className="h-52 flex items-center justify-center text-6xl">
                📦
              </div>

              <h3 className="text-white text-xl font-semibold">
                {deal.name}
              </h3>

              <div className="mt-4">

                <span className="text-emerald-400 text-2xl font-bold">
                  {deal.price}
                </span>

                <span className="text-gray-500 line-through ml-3">
                  {deal.oldPrice}
                </span>

              </div>

              <button className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl font-semibold text-white transition">
                Add to Cart
              </button>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default FlashDeals; 