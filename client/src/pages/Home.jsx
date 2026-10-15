import { useEffect, useState } from "react";

import Layout from "../components/layout/Layout";
import HeroBanner from "../components/home/HeroBanner";
import FlashDeals from "../components/home/FlashDeals";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import MarketplaceIntro from "../components/home/MarketplaceIntro";
import ProductDiscovery from "../components/home/ProductDiscovery";
import PersonalizedExperience from "../components/home/PersonalizedExperience";
import { apiRequest } from "../lib/api";

function Home() {
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setProductsLoading(true);
    setProductsError("");

    apiRequest("/api/products?limit=40", { timeout: 20000 })
      .then((data) => {
        if (cancelled) return;
        setMarketplaceProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch((error) => {
        if (cancelled) return;
        setMarketplaceProducts([]);
        setProductsError(error.message || "We couldn't load products right now.");
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function retryProducts() {
    setReloadKey((key) => key + 1);
  }

  return (
    <Layout>
      <HeroBanner />

      <PersonalizedExperience products={marketplaceProducts} />

      <Categories />

      {marketplaceProducts.length > 0 && (
        <FlashDeals products={marketplaceProducts} />
      )}

      <FeaturedProducts
        products={marketplaceProducts}
        loading={productsLoading}
        error={productsError}
        onRetry={retryProducts}
      />

      <ProductDiscovery
        initialProducts={marketplaceProducts}
        productsLoading={productsLoading}
      />

      <MarketplaceIntro />
    </Layout>
  );
}

export default Home;
