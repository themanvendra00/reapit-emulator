const COL_CLASSES = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

export function InfoGrid({ children, cols = 3 }) {
  return (
    <dl className={`grid grid-cols-1 gap-4 ${COL_CLASSES[cols] || COL_CLASSES[3]}`}>
      {children}
    </dl>
  );
}

export function InfoItem({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-inkmuted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{children ?? '—'}</dd>
    </div>
  );
}

export function Section({ title, children, actions }) {
  return (
    <div className="mb-6 rounded-2xl border border-line bg-surface p-5 shadow-flat">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}
