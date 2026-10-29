const PALETTES = {
  neutral: 'bg-neutral-bg text-neutral border-neutral-border',
  success: 'bg-success-bg text-success border-success-border',
  warning: 'bg-warning-bg text-warning border-warning-border',
  danger: 'bg-danger-bg text-danger border-danger-border',
  info: 'bg-info-bg text-info border-info-border',
};

// Back-compat aliases for the handful of call sites still passing the old
// Tailwind colour names directly via the `color` prop.
const ALIASES = { slate: 'neutral', green: 'success', amber: 'warning', red: 'danger', blue: 'info', purple: 'info' };

const STATUS_COLORS = {
  // checks
  needed: 'warning',
  arranging: 'info',
  completed: 'info',
  notNeeded: 'neutral',
  // offers
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
  noteOfInterest: 'info',
  noteOfInterestWithdrawn: 'neutral',
  // properties — selling status
  preAppraisal: 'neutral',
  valuation: 'neutral',
  paidValuation: 'info',
  forSale: 'success',
  forSaleUnavailable: 'success',
  underOffer: 'warning',
  underOfferUnavailable: 'warning',
  reserved: 'warning',
  exchanged: 'info',
  soldExternally: 'neutral',
};

export default function Badge({ children, color, status }) {
  const key = ALIASES[color] || color || STATUS_COLORS[status] || 'neutral';
  const palette = PALETTES[key] || PALETTES.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${palette}`}
    >
      {children}
    </span>
  );
}
