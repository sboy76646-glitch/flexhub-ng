import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const severityStyles = {
  high: "border-red-200 bg-red-50 text-red-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-blue-200 bg-blue-50 text-blue-800",
};

function ListingAIReport({ report, className = "" }) {
  if (!report || report.status === "not_checked") return null;

  const flags = Array.isArray(report.flags) ? report.flags : [];
  const clear = report.status === "clear" && flags.length === 0;

  return (
    <section
      className={`rounded-2xl border p-5 ${
        clear
          ? "border-emerald-200 bg-emerald-50"
          : "border-violet-200 bg-violet-50"
      } ${className}`}
      aria-label="AI listing quality report"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${clear ? "bg-emerald-600" : "bg-violet-600"} text-white`}>
            {clear ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              AI quality check
            </p>
            <h4 className="mt-1 text-lg font-black text-slate-950">
              {clear ? "No material flags found" : `${flags.length} item${flags.length === 1 ? "" : "s"} to review`}
            </h4>
          </div>
        </div>

        {Number.isFinite(Number(report.score)) && (
          <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-500">Listing quality</p>
            <p className="text-2xl font-black text-slate-950">{report.score}/100</p>
          </div>
        )}
      </div>

      {report.summary && (
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {report.summary}
        </p>
      )}

      {flags.length > 0 && (
        <div className="mt-4 grid gap-3">
          {flags.map((flag, index) => (
            <article
              key={`${flag.category}-${index}`}
              className={`rounded-xl border p-4 ${severityStyles[flag.severity] || severityStyles.low}`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 shrink-0" size={17} />
                <div>
                  <p className="font-black">{flag.title}</p>
                  <p className="mt-1 text-sm leading-6 opacity-90">{flag.detail}</p>
                  {flag.suggestion && (
                    <p className="mt-2 text-sm font-semibold">
                      Suggested action: {flag.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Advisory only. A FlexHub administrator still makes every verification decision.
      </p>
    </section>
  );
}

export default ListingAIReport;
