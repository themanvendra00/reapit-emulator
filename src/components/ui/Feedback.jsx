export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin text-ink ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-medium underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-mist text-inkmuted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 10h.01M15 10h.01M9 15c.6-.8 1.7-1.3 3-1.3s2.4.5 3 1.3" />
        </svg>
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      {message && <p className="text-sm text-inkmuted">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
