import { ChallanStatus } from '../../types';

export function StatusRocker({ status }: { status: ChallanStatus }) {
  return (
    <span className="status-pill" data-state={status}>
      {status === 'DRAFT' ? 'Draft' : status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
    </span>
  );
}
