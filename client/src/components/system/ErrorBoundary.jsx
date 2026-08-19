import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("FlexHub UI error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <section className="max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">FlexHub NG</p>
          <h1 className="mt-4 text-3xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-slate-300">Your cart and account data are safe. Refresh the page to continue.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-slate-950 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            Refresh FlexHub
          </button>
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;
