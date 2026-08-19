import { useEffect } from "react";

const BASE_URL = "https://www.flex-hub.com.ng";

function setMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function Seo({
  title = "FlexHub NG | Gadgets, Fashion and Lifestyle Marketplace",
  description = "Shop affordable gadgets, footwear, fashion accessories and lifestyle products from trusted sellers on FlexHub NG.",
  path = "/",
  noIndex = false,
}) {
  useEffect(() => {
    const url = `${BASE_URL}${path}`;
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="robots"]', "content", noIndex ? "noindex, nofollow" : "index, follow");
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
  }, [title, description, path, noIndex]);

  return null;
}
