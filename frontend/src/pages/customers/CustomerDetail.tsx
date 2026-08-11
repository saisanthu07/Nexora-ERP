import { FormEvent, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { addNote, getCustomer } from '../../api/customers.api';
import { CustomerStatusBadge } from '../../components/shared/StatusBadge';
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
        <CustomerStatusBadge status={customer.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="paper-card">
          <div className="section-title">Profile</div>
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
            <strong>Type:</strong> {customer.type}
          </p>
          <p>
            <strong>Follow-up date:</strong>{' '}
            {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : '—'}
          </p>
        </div>

        <div className="paper-card">
          <div className="section-title">Follow-up Notes</div>
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

          <div className="notes-list">
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
    </div>
  );
}
