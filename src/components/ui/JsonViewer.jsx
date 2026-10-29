import { useState } from 'react';

export default function JsonViewer({ data, label = 'Raw API response' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-flat">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-ink"
      >
        {label}
        <span className="text-xs text-inkmuted">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <pre className="max-h-[32rem] overflow-auto border-t border-line bg-accent px-4 py-3 text-xs text-white">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
