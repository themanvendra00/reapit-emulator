import { ArrowDownIcon, ArrowUpIcon } from '../icons.jsx';

export default function StatCard({ icon: IconCmp, label, value, loading, trend, sublabel }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-flat">
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-mist text-ink">
          {IconCmp && <IconCmp className="h-[18px] w-[18px]" strokeWidth={1.5} />}
        </span>
        {trend !== undefined && trend !== null && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              trend >= 0 ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
            }`}
          >
            {trend >= 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-[13px] font-medium text-ink">{label}</p>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
          {loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-mist" /> : value}
        </p>
        {sublabel && <span className="text-[11px] text-inkmuted">{sublabel}</span>}
      </div>
    </div>
  );
}
