import Navbar from "../components/layout/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-bold text-white mb-10">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">

            <h2 className="text-2xl text-gray-400">
              Your cart is empty 🛒
            </h2>

          </div>
        ) : (
          <>
            <div className="space-y-6">

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="bg-slate-800 rounded-xl p-5 flex items-center justify-between"
                >

                  <div className="flex items-center gap-6">

                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />

                    <div>

                      <h2 className="text-xl text-white font-semibold">
                        {item.name}
                      </h2>

                      <p className="text-gray-400">
                        ₦{item.price.toLocaleString()}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="bg-slate-700 px-3 py-1 rounded"
                    >
                      -
                    </button>

                    <span className="text-white">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="bg-slate-700 px-3 py-1 rounded"
                    >
                      +
                    </button>

                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                  >
                    Remove
                  </button>

                </div>

              ))}

            </div>

            <div className="mt-12 bg-slate-800 rounded-xl p-8">

              <h2 className="text-3xl font-bold text-white">
                Total
              </h2>

              <p className="text-emerald-400 text-4xl mt-4">
                ₦{total.toLocaleString()}
              </p>

              <button className="mt-8 bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-semibold">
                Proceed to Checkout
              </button>

            </div>

          </>
        )}

      </div>
    </>
  );
}

export default Cart; 