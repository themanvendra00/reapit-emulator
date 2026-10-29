const VARIANTS = {
  primary:
    'bg-accent text-white hover:opacity-90 focus-visible:outline-accent disabled:opacity-50',
  secondary:
    'bg-surface text-ink border border-ink hover:bg-mist focus-visible:outline-ink disabled:text-inkmuted disabled:border-line',
  danger:
    'bg-danger text-white hover:opacity-90 focus-visible:outline-danger disabled:opacity-50',
  ghost:
    'bg-transparent text-inkmuted hover:bg-mist hover:text-ink focus-visible:outline-inkmuted',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-3.5 w-3.5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export function IconButton({ className = '', active = false, ...props }) {
  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        active
          ? 'border-accent bg-accent text-white'
          : 'border-line bg-surface text-inkmuted hover:bg-mist hover:text-ink'
      } ${className}`}
      {...props}
    />
  );
}
