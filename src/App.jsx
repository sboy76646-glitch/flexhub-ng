import FeaturedProducts from "./components/home/FeaturedProducts";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";
import Categories from "./components/home/Categories";
import HeroBanner from "./components/home/HeroBanner";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <HeroBanner />
      <Categories />
      <FeaturedProducts />
    </div>
  );
}

export default App; 