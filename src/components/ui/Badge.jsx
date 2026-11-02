import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

const TONE_CLASSES = {
  neutral: "border-neutral-border bg-neutral-bg text-neutral",
  success: "border-success-border bg-success-bg text-success",
  warning: "border-warning-border bg-warning-bg text-warning",
  danger: "border-danger-border bg-danger-bg text-danger",
  info: "border-info-border bg-info-bg text-info",
}

// Back-compat aliases for the handful of call sites still passing the old
// Tailwind colour names directly via the `color` prop.
const ALIASES = { slate: "neutral", green: "success", amber: "warning", red: "danger", blue: "info", purple: "info" }

const STATUS_TONES = {
  // checks
  needed: "warning",
  arranging: "info",
  completed: "info",
  notNeeded: "neutral",
  // offers
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  withdrawn: "neutral",
  noteOfInterest: "info",
  noteOfInterestWithdrawn: "neutral",
  // properties — selling status
  preAppraisal: "neutral",
  valuation: "neutral",
  paidValuation: "info",
  forSale: "success",
  forSaleUnavailable: "success",
  underOffer: "warning",
  underOfferUnavailable: "warning",
  reserved: "warning",
  exchanged: "info",
  soldExternally: "neutral",
}

// Default export used throughout the app: a status/tone pill built on the
// shadcn Badge primitive.
export default function AppBadge({ children, color, status, className }) {
  const tone = ALIASES[color] || color || STATUS_TONES[status] || "neutral"
  return (
    <Badge variant="outline" className={cn(TONE_CLASSES[tone] || TONE_CLASSES.neutral, className)}>
      {children}
    </Badge>
  )
}

export { Badge, badgeVariants }
