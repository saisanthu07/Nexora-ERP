import { FormEvent, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { addNote, getCustomer } from '../../api/customers.api';
import { CustomerStatusBadge, ChallanStatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/FormControls';

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id as string),
    enabled: Boolean(id),
  });

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!id || !note.trim()) return;
    setSubmitting(true);
    try {
      await addNote(id, note.trim());
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success('Follow-up note added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !customer) {
    return (
      <div className="center-loading">
        <div className="spinner" />
      </div>
    );
  }

  const challans = (customer as any).challans || [];
  const confirmedChallans = challans.filter((c: any) => c.status === 'CONFIRMED');
  const totalSpent = confirmedChallans.reduce((sum: number, c: any) => sum + Number(c.totalAmount || 0), 0);

  return (
    <div>
      <Link to="/customers" style={{ fontSize: 13 }}>
        ← Back to Customer Ledger
      </Link>

      <div className="page-header" style={{ marginTop: 12 }}>
        <div>
          <h2>{customer.name}</h2>
          <p>{customer.businessName || 'No business name on file'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--paper-600)', textTransform: 'uppercase' }}>Total Billed</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy-900)' }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </div>
          </div>
          <CustomerStatusBadge status={customer.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="paper-card">
          <div className="section-title">Profile Info</div>
          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>
          <p>
            <strong>Email:</strong> {customer.email || '—'}
          </p>
          <p>
            <strong>Address:</strong> {customer.address || '—'}
          </p>
          <p>
            <strong>GST:</strong> {customer.gstNumber || '—'}
          </p>
          <p>
            <strong>Customer Type:</strong> {customer.type}
          </p>
          <p>
            <strong>Follow-up date:</strong>{' '}
            {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : '—'}
          </p>
        </div>

        <div className="paper-card">
          <div className="section-title">Follow-up Notes & Interactions</div>
          <form onSubmit={handleAddNote} style={{ marginBottom: 14 }}>
            <Textarea
              rows={2}
              placeholder="Log a call, visit, or follow-up outcome…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button type="submit" variant="brass" size="sm" disabled={submitting} style={{ marginTop: 8 }}>
              {submitting ? 'Adding…' : 'Add Note'}
            </Button>
          </form>

          <div className="notes-list" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {(customer.notes || []).map((n) => (
              <div className="note-item" key={n.id}>
                {n.content}
                <div className="note-meta">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {(customer.notes || []).length === 0 && <p className="field-hint">No notes yet.</p>}
          </div>
        </div>
      </div>

      {/* Customer Sales Orders & Invoices History */}
      <div style={{ marginTop: 24 }}>
        <div className="section-title">📦 Customer Sales Order History ({challans.length})</div>
        <div className="ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Items Count</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c: any) => (
                <tr key={c.id} onClick={() => (window.location.href = `/challans/${c.id}`)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.challanNumber}</td>
                  <td>{c.totalQuantity || c.items?.length || 0} items</td>
                  <td>
                    <ChallanStatusBadge status={c.status} />
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="text-right" style={{ fontWeight: 700 }}>
                    ₹{Number(c.totalAmount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {challans.length === 0 && (
                <tr>
                  <td colSpan={5} className="ledger-empty">
                    No sales orders generated for this customer yet.
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

