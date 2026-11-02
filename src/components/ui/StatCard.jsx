import { Card, CardAction, CardContent, CardHeader } from './card.jsx';
import { Skeleton } from './skeleton.jsx';
import { ArrowDownIcon, ArrowUpIcon } from '../icons.jsx';

export default function StatCard({ icon: IconCmp, label, value, loading, trend, sublabel }) {
  return (
    <Card>
      <CardHeader className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-foreground">
          {IconCmp && <IconCmp className="h-[18px] w-[18px]" strokeWidth={1.5} />}
        </span>
        {trend !== undefined && trend !== null && (
          <CardAction
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              trend >= 0 ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
            }`}
          >
            {trend >= 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
            {Math.abs(trend)}%
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <div className="mt-1 flex items-baseline justify-between">
          {loading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <p className="text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              {value}
            </p>
          )}
          {sublabel && <span className="text-[11px] text-muted-foreground">{sublabel}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
