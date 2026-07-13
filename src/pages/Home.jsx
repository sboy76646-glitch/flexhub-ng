import { useState } from "react";

import Navbar from "../components/layout/Navbar";
import HeroBanner from "../components/home/HeroBanner";
import FlashDeals from "../components/home/FlashDeals";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";

function Home() {
  const [search, setSearch] = useState("");

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
      />

      <HeroBanner />

      <FlashDeals />

      <Categories />

      <FeaturedProducts search={search} />
    </>
  );
}

export default Home; 