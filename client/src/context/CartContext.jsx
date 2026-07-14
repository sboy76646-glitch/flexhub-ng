import {
  createContext,
  useContext,
  useState,
} from "react";

import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(product, quantity = 1) {
    setCartItems((previousItems) => {
      const existingProduct = previousItems.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return previousItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...previousItems,
        {
          ...product,
          quantity,
        },
      ];
    });

    toast.success(
      `${quantity} × ${product.name} added to cart`
    );
  }

  function removeFromCart(id) {
    setCartItems((previousItems) => {
      const product = previousItems.find(
        (item) => item.id === id
      );

      if (product) {
        toast.error(`${product.name} removed from cart`);
      }

      return previousItems.filter(
        (item) => item.id !== id
      );
    });
  }

  function increaseQuantity(id) {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCartItems([]);
    toast.success("Cart cleared");
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
} 