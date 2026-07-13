import ProductCard from "../product/ProductCard";
import products from "../../data/products";

function FeaturedProducts() {
  return (
    <section className="bg-slate-950 py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-white mb-12">

          ⭐ Featured Products

        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {products.map(product=>(
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </div>

    </section>
  );
}

export default FeaturedProducts; 