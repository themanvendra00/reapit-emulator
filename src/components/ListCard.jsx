import { IconButton } from './ui/Button.jsx';
import { DownloadIcon, MoreIcon, SearchIcon } from './icons.jsx';

export default function ListCard({ title, searchValue, onSearchChange, searchPlaceholder, onExport, filters, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-flat">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {onSearchChange && (
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-inkmuted" strokeWidth={1.5} />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || 'Search…'}
                className="h-9 w-48 rounded-full border border-line bg-surface py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-inkmuted focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-ink/10"
              />
            </div>
          )}
          {onExport && (
            <IconButton onClick={onExport} title="Export CSV" aria-label="Export CSV">
              <DownloadIcon className="h-4 w-4" strokeWidth={1.5} />
            </IconButton>
          )}
          <IconButton className="cursor-default text-line hover:bg-surface hover:text-line">
            <MoreIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
      {children}
    </div>
  );
}
