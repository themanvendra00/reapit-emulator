import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog.jsx';

const WIDTHS = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

// Default export used throughout the app: a titled dialog with an optional
// footer, built on the shadcn Dialog primitive.
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent className={`${WIDTHS[size]} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm">{children}</div>
        {footer && (
          <div className="-mx-4 -mb-4 flex justify-end gap-2 rounded-b-xl border-t bg-muted/50 p-4">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
