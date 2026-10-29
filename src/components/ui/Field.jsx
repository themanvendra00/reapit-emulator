export function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-ink">
      {children}
    </label>
  );
}

const baseInput =
  'w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm text-ink shadow-none placeholder:text-inkmuted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-ink/10 disabled:bg-mist disabled:text-inkmuted';

export function Input({ className = '', ...props }) {
  return <input className={`${baseInput} ${className}`} {...props} />;
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${baseInput} h-auto py-2 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${baseInput} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function FieldGroup({ label, children, htmlFor, hint }) {
  return (
    <div>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-xs text-inkmuted">{hint}</p>}
    </div>
  );
}
