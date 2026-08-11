import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cancelChallan, confirmChallan, getChallan } from '../../api/challans.api';
import { ChallanStatusBadge } from '../../components/shared/StatusBadge';
import { StatusRocker } from '../../components/shared/StatusRocker';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../auth/AuthContext';

export function ChallanDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const { data: challan, isLoading } = useQuery({
    queryKey: ['challan', id],
    queryFn: () => getChallan(id as string),
    enabled: Boolean(id),
  });

  const canWrite = user?.role === 'ADMIN' || user?.role === 'SALES';
  const canCancel = user?.role === 'ADMIN';

  async function handleConfirm() {
    if (!id) return;
    setActionError('');
    setConfirming(true);
    try {
      await confirmChallan(id);
      queryClient.invalidateQueries({ queryKey: ['challan', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Challan confirmed — stock updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm challan';
      setActionError(message);
      toast.error(message);
    } finally {
      setConfirming(false);
    }
  }

  async function handleCancel() {
    if (!id) return;
    try {
      await cancelChallan(id);
      queryClient.invalidateQueries({ queryKey: ['challan', id] });
      toast.success('Challan cancelled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel challan');
    }
  }

  if (isLoading || !challan) {
    return (
      <div className="center-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/challans" style={{ fontSize: 13 }}>
        ← Back to Sales Challans
      </Link>

      <div className="page-header" style={{ marginTop: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-mono)' }}>{challan.challanNumber}</h2>
          <p>
            {challan.customer?.name} {challan.customer?.businessName ? `— ${challan.customer.businessName}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ChallanStatusBadge status={challan.status} />
          <StatusRocker status={challan.status} />
        </div>
      </div>

      <div className="ledger-wrap" style={{ marginBottom: 20 }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item) => (
              <tr key={item.id}>
                <td>{item.productNameSnapshot}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{item.skuSnapshot}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">₹{Number(item.priceSnapshot).toLocaleString('en-IN')}</td>
                <td className="text-right">₹{Number(item.lineTotal).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          <div>
            <div className="stat-label">Total Quantity</div>
            <div className="stat-value" style={{ fontSize: 24 }}>
              {challan.totalQuantity ?? challan.items.reduce((acc, i) => acc + i.quantity, 0)} pcs
            </div>
          </div>
          <div>
            <div className="stat-label">Total Amount</div>
            <div className="stat-value" style={{ fontSize: 28 }}>
              ₹{Number(challan.totalAmount).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {challan.status === 'DRAFT' ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {canCancel && (
              <Button variant="danger" onClick={handleCancel}>
                Cancel Challan
              </Button>
            )}
            {canWrite && (
              <Button variant="felt" onClick={handleConfirm} disabled={confirming}>
                {confirming ? 'Confirming…' : '✓ Confirm & Reduce Stock'}
              </Button>
            )}
          </div>
        ) : (
          <Button variant="felt" onClick={() => window.print()}>
            📄 Export Invoice as PDF
          </Button>
        )}
      </div>

      {actionError && (
        <p className="field-error" style={{ marginTop: 14 }}>
          {actionError}
        </p>
      )}

      {challan.status === 'CONFIRMED' && challan.confirmedAt && (
        <p className="field-hint" style={{ marginTop: 14 }}>
          Confirmed on {new Date(challan.confirmedAt).toLocaleString()} by {challan.createdBy?.name}
        </p>
      )}
    </div>
  );
}
