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
    const exists = wishlistItems.find(
      (item) => item.id === product.id
    );

    if (!exists) {
      setWishlistItems([...wishlistItems, product]);
      toast.success(`${product.name} added to wishlist ❤️`);
    }
  }

  function removeFromWishlist(id) {
    const product = wishlistItems.find(
      (item) => item.id === id
    );

    setWishlistItems(
      wishlistItems.filter((item) => item.id !== id)
    );

    if (product) {
      toast.error(`${product.name} removed from wishlist`);
    }
  }

  function isInWishlist(id) {
    return wishlistItems.some((item) => item.id === id);
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
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