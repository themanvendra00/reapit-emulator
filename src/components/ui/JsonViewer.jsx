import { useState } from 'react';
import { Card } from './card.jsx';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function JsonViewer({ data, label = 'Raw API response' }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
      >
        {label}
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          {open ? 'Hide' : 'Show'}
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>
      {open && (
        <pre className="max-h-[32rem] overflow-auto border-t border-border bg-foreground px-4 py-3 text-xs text-background">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </Card>
  );
}
