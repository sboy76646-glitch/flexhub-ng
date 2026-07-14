import products from "../../data/products";
import ProductGrid from "../product/ProductGrid";

function FeaturedProducts() {
  return (
    <section className="bg-slate-950 py-20">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-white mb-12">
          ⭐ Featured Products
        </h2>

        <ProductGrid products={products} />

      </div>
    </section>
  );
}

export default FeaturedProducts; 