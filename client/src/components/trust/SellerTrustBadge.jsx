import { Award, BadgeCheck, Medal } from "lucide-react";

const styles = {
  basic: {
    icon: Medal,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  verified: {
    icon: BadgeCheck,
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  premium: {
    icon: Award,
    className: "border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-900",
  },
};

function SellerTrustBadge({ sellerTrust, showScore = true }) {
  const tier = sellerTrust?.tier || { id: "basic", label: "Basic Seller" };
  const style = styles[tier.id] || styles.basic;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${style.className}`}>
      <Icon size={15} />
      {tier.label}
      {showScore && <span className="border-l border-current/20 pl-2">{sellerTrust?.score || 0}/100</span>}
    </span>
  );
}

export default SellerTrustBadge;
