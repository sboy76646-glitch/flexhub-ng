import { useState } from "react";

import Layout from "../components/layout/Layout";
import HeroBanner from "../components/home/HeroBanner";
import FlashDeals from "../components/home/FlashDeals";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";

function Home() {
  const [search, setSearch] = useState("");

  return (
    <Layout
      search={search}
      setSearch={setSearch}
    >
      <HeroBanner />

      <FlashDeals />

      <Categories />

      <FeaturedProducts search={search} />
    </Layout>
  );
}

export default Home; 