function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const chars = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0][0]];
  return chars.join('').toUpperCase();
}

export default function Avatar({ name, size = 'md' }) {
  const sizes = {
    sm: 'h-7 w-7 text-[11px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-11 w-11 text-sm',
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-mist font-semibold text-ink ${sizes[size]}`}
    >
      {initials(name)}
    </span>
  );
}
