import { useEffect, useState } from "react";

const heroSlides = [
  {
    image: "/hero-marketplace.jpg",
    alt: "Phones and technology products",
  },
  {
    image: "/hero-laptops.jpg",
    alt: "Laptops and computing products",
  },
  {
    image: "/hero-fashion.jpg",
    alt: "Fashion products",
  },
  {
    image: "/hero-audio.jpg",
    alt: "Audio products",
  },
  {
    image: "/hero-gaming.jpg",
    alt: "Gaming products",
  },
];

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.image}
          aria-hidden={index !== activeSlide}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={index === activeSlide ? slide.alt : ""}
            className="
              absolute inset-0
              h-full w-full
              object-cover
              object-center
              sm:object-center
            "
          />
        </div>
      ))}

      {/* Very subtle readability layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white/[0.03]"
      />

      {/* Small brand accent */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          top-16
          h-56
          w-56
          rounded-full
          bg-orange-500/[0.06]
          blur-3xl
          sm:h-72
          sm:w-72
        "
      />

      {/* Slideshow indicators */}
      <div
        className="
          absolute
          bottom-4
          left-1/2
          z-20
          flex
          -translate-x-1/2
          items-center
          gap-2
          sm:bottom-5
        "
        aria-label="Hero slideshow navigation"
      >
        {heroSlides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeSlide}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeSlide
                ? "w-7 bg-orange-500"
                : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Hero;