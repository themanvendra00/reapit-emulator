import Button from './Button.jsx';

export default function Pagination({ page, totalPages, totalCount, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-3">
      <p className="text-xs text-inkmuted">
        Page {page} of {totalPages}
        {typeof totalCount === 'number' && ` · ${totalCount} total`}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
