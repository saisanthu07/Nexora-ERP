import { ChallanStatus, CustomerStatus } from '../../types';

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const cls = status === 'ACTIVE' ? 'badge-active' : status === 'INACTIVE' ? 'badge-inactive' : 'badge-lead';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function ChallanStatusBadge({ status }: { status: ChallanStatus }) {
  const cls =
    status === 'CONFIRMED' ? 'badge-confirmed' : status === 'CANCELLED' ? 'badge-cancelled' : 'badge-draft';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function LowStockBadge() {
  return <span className="badge badge-low">Low Stock</span>;
}
