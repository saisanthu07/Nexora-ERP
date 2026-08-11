import { PaginationMeta } from '../../types';
import { Button } from '../ui/Button';

export function PaginationBar({
  meta,
  onPageChange,
}: {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="pagination">
      <Button variant="ghost" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
        ← Prev
      </Button>
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Next →
      </Button>
    </div>
  );
}
