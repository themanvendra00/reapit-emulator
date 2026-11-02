import { SearchIcon } from "./icons.jsx";
import { Card } from "./ui/card.jsx";
import { Input } from "./ui/Field.jsx";

export default function ListCard({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  children,
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {onSearchChange && (
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || "Search…"}
                className="h-9 w-48 rounded-full pl-8"
              />
            </div>
          )}
        </div>
      </div>
      {children}
    </Card>
  );
}
