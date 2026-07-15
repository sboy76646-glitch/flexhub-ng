import macbookImage from "../assets/images/macbook-air-m3.jpg";

const products = [
  {
    id: 1,
    name: "Samsung Galaxy S24",
    category: "Phones",
    price: 980000,
    oldPrice: 1100000,
    rating: 4.8,
    stock: 12,
    storeId: "flexhub-direct",
    storeName: "FlexHub Direct",
    sellerVerified: true,
    deliveryEstimate: "2–5 working days",
    reviewCount: 42,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&auto=format&fit=crop",
    description:
      "Experience flagship performance with the Samsung Galaxy S24, featuring a stunning AMOLED display, powerful processor, professional-grade cameras, and dependable all-day battery life.",
  },
  {
    id: 2,
    name: "Nike Air Force 1",
    category: "Sneakers",
    price: 165000,
    oldPrice: 200000,
    rating: 4.9,
    stock: 8,
    storeId: "sole-district",
    storeName: "Sole District",
    sellerVerified: true,
    deliveryEstimate: "3–6 working days",
    reviewCount: 31,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop",
    description:
      "Classic Nike Air Force 1 sneakers with premium construction, timeless styling, and reliable comfort for everyday wear.",
  },
  {
    id: 3,
    name: "MacBook Air M3",
    category: "Laptops",
    price: 2200000,
    oldPrice: 2400000,
    rating: 5.0,
    stock: 5,
    storeId: "flexhub-direct",
    storeName: "FlexHub Direct",
    sellerVerified: true,
    deliveryEstimate: "2–5 working days",
    reviewCount: 19,
    image: macbookImage,
    description:
      "Apple MacBook Air powered by the M3 chip, delivering excellent speed, long battery life, a sharp display, and a lightweight premium design.",
  },
  {
    id: 4,
    name: "Sony WH-1000XM5",
    category: "Audio",
    price: 480000,
    oldPrice: 520000,
    rating: 4.9,
    stock: 18,
    storeId: "sound-space",
    storeName: "Sound Space",
    sellerVerified: true,
    deliveryEstimate: "3–6 working days",
    reviewCount: 36,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop",
    description:
      "Premium wireless headphones with excellent noise cancellation, rich sound quality, and comfortable all-day wear.",
  },
];

export default products;
