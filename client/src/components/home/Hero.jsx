function Hero() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-[1.04] bg-cover bg-center motion-safe:animate-[hero-pan_18s_ease-in-out_infinite_alternate]"
        style={{
          backgroundImage: "url('/hero-marketplace.jpg')",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/45"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_76%_38%,rgba(249,115,22,0.18),transparent_28rem)]"
      />

      <div
        aria-hidden="true"
        className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl motion-safe:animate-pulse"
      />

      <style>{`
        @keyframes hero-pan {
          0% {
            transform: scale(1.04) translate3d(0, 0, 0);
          }

          100% {
            transform: scale(1.1) translate3d(-1.5%, -1%, 0);
          }
        }
      `}</style>
    </>
  );
}

export default Hero; 