import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout";
import HeroBanner from "../components/home/HeroBanner";
import FlashDeals from "../components/home/FlashDeals";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import MarketplaceIntro from "../components/home/MarketplaceIntro";
import { apiRequest } from "../lib/api";

function Home() {
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    apiRequest("/api/products")
      .then((data) => {
        if (!cancelled) {
          setMarketplaceProducts(data.products || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarketplaceProducts([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <HeroBanner />

      <MarketplaceIntro />

      {marketplaceProducts.length > 0 && (
        <FlashDeals products={marketplaceProducts} />
      )}

      <Categories />

      <FeaturedProducts products={marketplaceProducts} />
    </Layout>
  );
}

export default Home; 