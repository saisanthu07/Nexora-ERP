import { ChallanStatus } from '../../types';

export function StatusRocker({ status }: { status: ChallanStatus }) {
  return (
    <div className="rocker" data-state={status} title={`Status: ${status}`}>
      <div className="rocker-knob" />
      <span className="rocker-label">{status === 'DRAFT' ? 'DRAFT' : status === 'CONFIRMED' ? 'LIVE' : 'VOID'}</span>
    </div>
  );
}
