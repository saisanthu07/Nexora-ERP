import { FormEvent, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProduct, listStockMovements, recordStockMovement } from '../../api/products.api';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/FormControls';
import { LowStockBadge } from '../../components/shared/StatusBadge';
import { useAuth } from '../../auth/AuthContext';
import { StockMovementType } from '../../types';

export function StockMovementLog() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ type: 'IN' as StockMovementType, quantity: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id as string),
    enabled: Boolean(id),
  });

  const { data: movements } = useQuery({
    queryKey: ['stock-movements', id],
    queryFn: () => listStockMovements(id as string, { page: 1, limit: 25 }),
    enabled: Boolean(id),
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError('');
    setSubmitting(true);
    try {
      await recordStockMovement(id, { type: form.type, quantity: Number(form.quantity), reason: form.reason });
      setForm({ type: 'IN', quantity: '', reason: '' });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements', id] });
      toast.success('Stock movement recorded');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record movement';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !product) {
    return (
      <div className="center-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/products" style={{ fontSize: 13 }}>
        ← Back to Inventory Register
      </Link>

      <div className="page-header" style={{ marginTop: 12 }}>
        <div>
          <h2>{product.name}</h2>
          <p>
            SKU {product.sku} · {product.category} · {product.warehouse}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-value" style={{ fontSize: 26 }}>
            {product.stock} in stock
          </div>
          {product.stock <= product.minStock && <LowStockBadge />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: canManage ? '1fr 1.4fr' : '1fr', gap: 20 }}>
        {canManage && (
          <div className="paper-card">
            <div className="section-title">Record Stock Movement</div>
            <form onSubmit={handleSubmit}>
              <Field label="Movement Type">
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as StockMovementType })}>
                  <option value="IN">Stock IN</option>
                  <option value="OUT">Stock OUT</option>
                </Select>
              </Field>
              <Field label="Quantity">
                <Input type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </Field>
              <Field label="Reason">
                <Input required placeholder="e.g. Purchase order #4521, damaged goods" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </Field>
              {error && <p className="field-error">{error}</p>}
              <Button type="submit" variant="brass" disabled={submitting}>
                {submitting ? 'Recording…' : 'Record Movement'}
              </Button>
            </form>
          </div>
        )}

        <div className="ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th className="text-right">Qty</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {(movements?.items || []).map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${m.type === 'IN' ? 'badge-active' : 'badge-inactive'}`}>{m.type}</span>
                  </td>
                  <td className="text-right">{m.quantity}</td>
                  <td>{m.reason}</td>
                </tr>
              ))}
              {(movements?.items || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="ledger-empty">
                    No stock movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
