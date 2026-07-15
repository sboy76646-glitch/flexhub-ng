/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem("flexhub-wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "flexhub-wishlist",
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems]);

  function addToWishlist(product) {
    setWishlistItems((prevItems) => {
      const exists = prevItems.find(
        (item) => item.id === product.id
      );

      if (exists) return prevItems;

      toast.success(`${product.name} added to wishlist ❤️`);

      return [...prevItems, product];
    });
  }

  function removeFromWishlist(id) {
    setWishlistItems((prevItems) => {
      const product = prevItems.find(
        (item) => item.id === id
      );

      if (product) {
        toast.error(`${product.name} removed from wishlist`);
      }

      return prevItems.filter(
        (item) => item.id !== id
      );
    });
  }

  function clearWishlist() {
    setWishlistItems([]);
  }

  function isInWishlist(id) {
    return wishlistItems.some(
      (item) => item.id === id
    );
  }

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
