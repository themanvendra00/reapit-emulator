export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-inkmuted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
