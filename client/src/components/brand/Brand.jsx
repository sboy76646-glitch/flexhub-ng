import brandMark from "../../assets/logo/flexhub-mark.svg";

export function NigeriaFlag({ className = "h-[0.72em] w-[1.08em]" }) {
  return (
    <svg
      viewBox="0 0 3 2"
      aria-hidden="true"
      className={`inline-block shrink-0 overflow-hidden rounded-[0.12em] shadow-sm ring-1 ring-black/10 ${className}`}
    >
      <rect width="1" height="2" x="0" fill="#008751" />
      <rect width="1" height="2" x="1" fill="#ffffff" />
      <rect width="1" height="2" x="2" fill="#008751" />
    </svg>
  );
}

export function BrandName({ className = "", uppercase = false, flagClassName = "" }) {
  return (
    <span className={`inline-flex items-center gap-[0.3em] whitespace-nowrap align-[-0.08em] ${className}`}>
      <span>{uppercase ? "FLEXHUB NG" : "FlexHub NG"}</span>
      <NigeriaFlag className={flagClassName || undefined} />
    </span>
  );
}

export function BrandMark({ className = "h-11 w-11" }) {
  return <img src={brandMark} alt="" className={`shrink-0 ${className}`} />;
}

export function BrandLogo({
  className = "",
  markClassName = "h-11 w-11",
  textClassName = "inline-flex text-xl",
  theme = "dark",
}) {
  const mainText = theme === "dark" ? "text-white" : "text-slate-950";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <BrandMark className={markClassName} />
      <span className={`items-center gap-2 font-black tracking-tight ${textClassName}`}>
        <span className={mainText}>FLEX</span>
        <span className="-ml-2 text-orange-500">HUB</span>
        <span className={`-ml-1 ${mainText}`}>NG</span>
        <NigeriaFlag className="h-[0.68em] w-[1.02em]" />
      </span>
    </span>
  );
}
