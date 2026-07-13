import categories from "../../data/categories";

function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-center">
  Explore Our{" "}
  <span className="text-emerald-400">Categories</span>
</h2>
<p className="text-gray-400 text-center mt-4 mb-12">
  Discover premium gadgets, fashion, and accessories handpicked for you.
</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <div
              key={category.id}
              className="bg-slate-900 rounded-2xl p-8 flex flex-col items-center cursor-pointer hover:bg-emerald-500 transition-all duration-300 hover:scale-105"
            >
              <Icon size={42} />

              <h3 className="mt-4 font-semibold">
                {category.name}
              </h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Categories; 