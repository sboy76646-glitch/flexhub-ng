import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Image,
  MapPinCheck,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  UserRoundCheck,
  Video,
} from "lucide-react";

import SellerTrustBadge from "./SellerTrustBadge";

const conditionLabels = {
  brand_new: "Brand new",
  imported_new: "Imported new",
  open_box: "Open box",
  uk_used: "UK used",
  refurbished: "Refurbished",
  used: "Used",
};

function dateRange(deliveryEstimate) {
  if (typeof deliveryEstimate === "string") return deliveryEstimate;
  if (!deliveryEstimate?.start || !deliveryEstimate?.end) return "Confirmed at checkout";
  const formatter = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short" });
  return `${formatter.format(new Date(deliveryEstimate.start))}–${formatter.format(new Date(deliveryEstimate.end))}`;
}

function TrustRow({ icon: Icon, label, value, verified = null }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3.5 last:border-0">
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${verified === true ? "bg-emerald-100 text-emerald-700" : verified === false ? "bg-slate-100 text-slate-400" : "bg-orange-50 text-orange-600"}`}>
        {verified === true ? <CheckCircle2 size={17} /> : verified === false ? <CircleAlert size={17} /> : <Icon size={17} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-1 text-sm font-bold ${verified === false ? "text-slate-500" : "text-slate-900"}`}>{value}</p>
      </div>
    </div>
  );
}

function ProductTrustCard({ product }) {
  const trust = product.trust || {};
  const seller = product.sellerTrust || {};
  const inspectionVerified = trust.productVerified && ["digital", "physical"].includes(trust.inspectionMethod);
  const warrantyAvailable = product.warranty && !/^no warranty/i.test(product.warranty);

  return (
    <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className={`p-6 text-white ${trust.productVerified ? "bg-emerald-700" : "bg-slate-800"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><ShieldCheck size={27} /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">FlexHub Trust</p><h2 className="mt-1 text-xl font-black">{trust.productVerified ? "FlexHub Verified" : "Verification not completed"}</h2></div>
          </div>
          {trust.productVerified && <BadgeCheck className="shrink-0" size={27} />}
        </div>
        <p className="mt-4 text-sm leading-6 text-white/80">Verification applies to the listing evidence shown below. It is not a manufacturer guarantee.</p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <SellerTrustBadge sellerTrust={seller} />
          <span className="text-sm font-black text-slate-900">Trust score {seller.score || 0}/100</span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${seller.score || 0}%` }} /></div>
        </div>

        <TrustRow icon={PackageCheck} label="Product verification" value={trust.productVerified ? "Verified by a FlexHub admin" : "Not FlexHub Verified"} verified={Boolean(trust.productVerified)} />
        <TrustRow icon={UserRoundCheck} label="Seller identity" value={seller.identityVerified ? "Identity verified" : "Identity check not completed"} verified={Boolean(seller.identityVerified)} />
        <TrustRow icon={MapPinCheck} label="Business address" value={seller.addressChecked ? "Address checked" : "Address check not completed"} verified={Boolean(seller.addressChecked)} />
        <TrustRow icon={ShieldCheck} label="Inspection" value={inspectionVerified ? (trust.inspectionMethod === "physical" ? "Physically inspected" : "Digitally verified") : "No product inspection recorded"} verified={inspectionVerified} />
        <TrustRow icon={Image} label="Product photos" value={trust.actualImagesVerified ? "Actual product photos confirmed" : "Photos not independently confirmed"} verified={Boolean(trust.actualImagesVerified)} />
        {product.videoUrl && <TrustRow icon={Video} label="FlexProof" value={trust.flexProofVerified ? "Product video verified" : "Seller video available—not yet verified"} verified={Boolean(trust.flexProofVerified)} />}
        <TrustRow icon={PackageCheck} label="Condition" value={conditionLabels[product.condition] || "Not specified"} />
        <TrustRow icon={BadgeCheck} label="Warranty" value={product.warranty || "No warranty information"} verified={Boolean(warrantyAvailable)} />
        <TrustRow icon={RotateCcw} label="Returns" value={product.returnWindowDays > 0 ? `${product.returnWindowDays}-day return eligible` : "Not return eligible"} verified={product.returnWindowDays > 0} />
        <TrustRow icon={CalendarDays} label="Expected delivery" value={`${dateRange(product.deliveryWindow || product.deliveryEstimate)} · ships in ${product.dispatchTimeDays || 0} day(s)`} />
        <TrustRow icon={Truck} label="Fulfilment" value={product.fulfillmentType === "flexhub" ? "Delivery handled by FlexHub" : "Delivery handled by seller"} />
        <TrustRow icon={ShoppingBag} label="Completed FlexHub orders" value={`${seller.completedOrders || 0} completed`} />
        <TrustRow icon={Star} label="Verified-purchase reviews" value={product.reviewCount > 0 ? `${product.rating}/5 from ${product.reviewCount} verified review${product.reviewCount === 1 ? "" : "s"}` : "No verified-purchase reviews yet"} />
      </div>
    </aside>
  );
}

export default ProductTrustCard;
