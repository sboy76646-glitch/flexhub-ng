import Layout from "../components/layout/Layout";
import HeroBanner from "../components/home/HeroBanner";
import FlashDeals from "../components/home/FlashDeals";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import MarketplaceIntro from "../components/home/MarketplaceIntro";

function Home() {
  return (
    <Layout>
      <HeroBanner />

      <MarketplaceIntro />

      <FlashDeals />

      <Categories />

      <FeaturedProducts />
    </Layout>
  );
}

export default Home;
