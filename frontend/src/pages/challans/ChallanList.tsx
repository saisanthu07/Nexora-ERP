import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { listChallans } from '../../api/challans.api';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/FormControls';
import { ChallanStatusBadge } from '../../components/shared/StatusBadge';
import { PaginationBar } from '../../components/shared/PaginationBar';
import { useAuth } from '../../auth/AuthContext';

export function ChallanList() {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';
  const navigate = useNavigate();

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['challans', status, page],
    queryFn: () => listChallans({ status: status || undefined, page, limit: 10 }),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Sales Challans</h2>
          <p>Draft, confirm, and track every dispatch document.</p>
        </div>
        {canCreate && (
          <Button variant="brass" onClick={() => navigate('/challans/new')}>
            + Create Challan
          </Button>
        )}
      </div>

      <div className="toolbar">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 180 }}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      <div className="ledger-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th>Challan #</th>
              <th>Customer</th>
              <th>Items</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((c) => (
              <tr key={c.id} onClick={() => navigate(`/challans/${c.id}`)}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{c.challanNumber}</td>
                <td>{c.customer?.name}</td>
                <td>{c.items.length}</td>
                <td className="text-right">₹{Number(c.totalAmount).toLocaleString('en-IN')}</td>
                <td>
                  <ChallanStatusBadge status={c.status} />
                </td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!isLoading && (data?.items || []).length === 0 && (
              <tr>
                <td colSpan={6} className="ledger-empty">
                  No challans yet. <Link to="/challans/new">Create one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <PaginationBar meta={data?.meta} onPageChange={setPage} />
      </div>
    </div>
  );
}
