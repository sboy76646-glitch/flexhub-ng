import AppRoutes from "./routes/AppRoutes";
import GoogleAnalyticsTracker from "./components/GoogleAnalyticsTracker";
import ErrorBoundary from "./components/system/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <GoogleAnalyticsTracker />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-950">Skip to main content</a>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App; 