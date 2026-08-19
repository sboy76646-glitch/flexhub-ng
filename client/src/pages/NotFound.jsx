import { Link } from "react-router-dom";
import Seo from "../components/system/Seo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <Seo title="Page Not Found | FlexHub NG" description="The FlexHub NG page you requested could not be found." path={window.location.pathname} noIndex />
      <section className="max-w-xl text-center">
        <p className="text-7xl font-black text-orange-500">404</p>
        <h1 className="mt-4 text-3xl font-bold">This page is not in the marketplace</h1>
        <p className="mt-3 text-slate-300">The link may be outdated, or the product or store may no longer be available.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-slate-950 hover:bg-orange-400">Browse products</Link>
          <Link to="/" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-900">Go home</Link>
        </div>
      </section>
    </main>
  );
}
