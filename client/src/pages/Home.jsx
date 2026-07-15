import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout";
import HeroBanner from "../components/home/HeroBanner";
import FlashDeals from "../components/home/FlashDeals";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import MarketplaceIntro from "../components/home/MarketplaceIntro";
import sampleProducts from "../data/products";
import { apiRequest } from "../lib/api";

function Home() {
  const [marketplaceProducts, setMarketplaceProducts] = useState(sampleProducts);

  useEffect(() => {
    let cancelled = false;

    apiRequest("/api/products")
      .then((data) => {
        if (!cancelled) setMarketplaceProducts(data.products);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <HeroBanner />

      <MarketplaceIntro />

      <FlashDeals products={marketplaceProducts} />

      <Categories />

      <FeaturedProducts products={marketplaceProducts} />
    </Layout>
  );
}

export default Home;
