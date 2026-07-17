import AppRoutes from "./routes/AppRoutes";
import GoogleAnalyticsTracker from "./components/GoogleAnalyticsTracker";

function App() {
  return (
    <>
      <GoogleAnalyticsTracker />
      <AppRoutes />
    </>
  );
}

export default App; 