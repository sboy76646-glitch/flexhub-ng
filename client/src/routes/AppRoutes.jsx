import {
  lazy,
  Suspense,
} from "react";
import {
  Route,
  Routes,
} from "react-router-dom";

const Home = lazy(() =>
  import("../pages/Home")
);

const Shop = lazy(() =>
  import("../pages/Shop")
);

const Cart = lazy(() =>
  import("../pages/Cart")
);

const Checkout = lazy(() =>
  import("../pages/Checkout")
);

const Wishlist = lazy(() =>
  import("../pages/Wishlist")
);

const Login = lazy(() =>
  import("../pages/Login")
);

const Register = lazy(() =>
  import("../pages/Register")
);

const VerifyEmail = lazy(() =>
  import("../pages/VerifyEmail")
);

const ForgotPassword = lazy(() =>
  import("../pages/ForgotPassword")
);

const VerifyResetOTP = lazy(() =>
  import("../pages/VerifyResetOTP")
);

const ResetPassword = lazy(() =>
  import("../pages/ResetPassword")
);

const Profile = lazy(() =>
  import("../pages/Profile")
);

const ProductDetails = lazy(() =>
  import("../pages/ProductDetails")
);

const Stores = lazy(() =>
  import("../pages/Stores")
);

const Storefront = lazy(() =>
  import("../pages/Storefront")
);

const Sell = lazy(() =>
  import("../pages/Sell")
);

const SellerDashboard = lazy(() =>
  import("../pages/SellerDashboard")
);

const AdminStores = lazy(() =>
  import("../pages/AdminStores")
);

const AdminMarketplace = lazy(() =>
  import("../pages/AdminMarketplace")
);

const PaymentCallback = lazy(() =>
  import("../pages/PaymentCallback")
);

const MyOrders = lazy(() =>
  import("../pages/MyOrders")
);

function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-950"
      role="status"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-orange-500" />

      <span className="sr-only">
        Loading page
      </span>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-reset-otp"
          element={<VerifyResetOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/stores"
          element={<Stores />}
        />

        <Route
          path="/stores/:storeId"
          element={<Storefront />}
        />

        <Route
          path="/sell"
          element={<Sell />}
        />

        <Route
          path="/seller"
          element={<SellerDashboard />}
        />

        <Route
          path="/admin/stores"
          element={<AdminStores />}
        />

        <Route
          path="/admin/marketplace"
          element={<AdminMarketplace />}
        />

        <Route
          path="/payment/callback"
          element={<PaymentCallback />}
        />

        <Route
          path="/orders"
          element={<MyOrders />}
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes; 