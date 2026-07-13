import Navbar from "../components/layout/Navbar";
import HeroBanner from "../components/home/HeroBanner";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <HeroBanner />
      <Categories />
      <FeaturedProducts />
    </div>
  );
}

export default Home; 