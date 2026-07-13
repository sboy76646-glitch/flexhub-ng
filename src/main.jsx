import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2500,
              style: {
                background: "#0f172a",
                color: "#fff",
                border: "1px solid #10b981",
              },
            }}
          />

          <App />

        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
); 