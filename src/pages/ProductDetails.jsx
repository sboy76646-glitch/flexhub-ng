import { useParams } from "react-router-dom";
import products from "../data/products";
import Navbar from "../components/layout/Navbar";

function ProductDetails() {
  const { id } = useParams();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <div className="text-white text-center mt-20">
        Product not found.
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">

        <img
          src={product.image}
          alt={product.name}
          className="rounded-2xl w-full"
        />

        <div>

          <h1 className="text-4xl font-bold text-white">
            {product.name}
          </h1>

          <p className="text-gray-400 mt-2">
            Category: {product.category}
          </p>

          <div className="mt-6">

            <span className="text-4xl text-emerald-400 font-bold">
              ₦{product.price.toLocaleString()}
            </span>

            <span className="text-gray-500 line-through ml-4">
              ₦{product.oldPrice.toLocaleString()}
            </span>

          </div>

          <p className="mt-8 text-gray-300 leading-7">
            This is a premium quality product available on FlexHub NG.
            More product descriptions, specifications, delivery details,
            and customer reviews will be added when we connect the backend.
          </p>

          <button className="mt-10 bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-semibold transition">
            Add to Cart
          </button>

        </div>

      </div>
    </>
  );
}

export default ProductDetails; 