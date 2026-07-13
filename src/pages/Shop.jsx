import { useMemo, useState } from "react";

import Navbar from "../components/layout/Navbar";
import ProductGrid from "../components/product/ProductGrid";
import products from "../data/products";

function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = useMemo(() => {
    let result =
      selectedCategory === "All"
        ? [...products]
        : products.filter(
            (product) => product.category === selectedCategory
          );

    switch (sortBy) {
      case "low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;

      default:
        break;
    }

    return result;
  }, [selectedCategory, sortBy]);

  return (
    <>
      <Navbar />

      <section className="bg-slate-950 min-h-screen py-12">

        <div className="max-w-7xl mx-auto px-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

            <h1 className="text-5xl font-bold text-white">
              Shop
            </h1>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800 text-white px-4 py-3 rounded-xl outline-none"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

          </div>

          <div className="flex flex-wrap gap-3 mb-10">

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full transition ${
                  selectedCategory === category
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                }`}
              >
                {category}
              </button>
            ))}

          </div>

          <ProductGrid products={filteredProducts} />

        </div>

      </section>
    </>
  );
}

export default Shop; 