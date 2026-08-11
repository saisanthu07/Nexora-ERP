import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listCustomers } from '../../api/customers.api';
import { listProducts } from '../../api/products.api';
import { createChallan } from '../../api/challans.api';
import { Button } from '../../components/ui/Button';
import { Field, Select, Input } from '../../components/ui/FormControls';
import { Product } from '../../types';

interface LineItem {
  productId: string;
  quantity: number;
}

export function ChallanCreate() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: customersData } = useQuery({
    queryKey: ['all-customers'],
    queryFn: () => listCustomers({ page: 1, limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => listProducts({ page: 1, limit: 100 }),
  });

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    (productsData?.items || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [productsData]);

  const total = lines.reduce((sum, line) => {
    const product = productsById.get(line.productId);
    return sum + (product ? Number(product.price) * line.quantity : 0);
  }, 0);

  function updateLine(index: number, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: '', quantity: 1 }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function hasStockIssue() {
    return lines.some((line) => {
      const product = productsById.get(line.productId);
      return product && line.quantity > product.stock;
    });
  }

  async function handleSubmit() {
    setError('');
    if (!customerId) {
      setError('Select a customer first');
      return;
    }
    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      setError('Add at least one product line');
      return;
    }

    setSubmitting(true);
    try {
      const challan = await createChallan({ customerId, items: validLines });
      toast.success(`Draft ${challan.challanNumber} created`);
      navigate(`/challans/${challan.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create challan';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Create Challan</h2>
          <p>Builds as a Draft — stock is only reduced when you confirm.</p>
        </div>
      </div>

      <div className="paper-card" style={{ maxWidth: 780 }}>
        <Field label="Customer">
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select a customer…</option>
            {(customersData?.items || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.businessName ? `— ${c.businessName}` : ''}
              </option>
            ))}
          </Select>
        </Field>

        <div className="section-title" style={{ marginTop: 18 }}>
          Line Items
        </div>

        <div className="ledger-wrap" style={{ marginBottom: 14 }}>
          <table className="ledger line-items-table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Product</th>
                <th className="text-right">Available</th>
                <th className="text-right" style={{ width: 120 }}>
                  Qty
                </th>
                <th className="text-right">Line Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => {
                const product = productsById.get(line.productId);
                const overStock = product && line.quantity > product.stock;
                return (
                  <tr key={index}>
                    <td>
                      <Select value={line.productId} onChange={(e) => updateLine(index, { productId: e.target.value })}>
                        <option value="">Select product…</option>
                        {(productsData?.items || []).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="text-right">{product ? product.stock : '—'}</td>
                    <td className="text-right">
                      <Input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
                        style={overStock ? { borderColor: 'var(--danger-600)' } : undefined}
                      />
                      {overStock && (
                        <div className="field-error" style={{ marginTop: 4 }}>
                          Exceeds available stock
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      {product ? `₹${(Number(product.price) * line.quantity).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td>
                      {lines.length > 1 && (
                        <button type="button" className="icon-btn" onClick={() => removeLine(index)}>
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={addLine}>
          + Add Line
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <div>
            <div className="stat-label">Total</div>
            <div className="stat-value" style={{ fontSize: 24 }}>
              ₹{total.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/challans')}>
              Cancel
            </Button>
            <Button type="button" variant="primary" disabled={submitting || hasStockIssue()} onClick={handleSubmit}>
              {submitting ? 'Saving…' : 'Save as Draft'}
            </Button>
          </div>
        </div>

        {error && (
          <p className="field-error" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
