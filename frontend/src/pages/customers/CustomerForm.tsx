import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal';
import { Field, Input, Select, Textarea } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { createCustomer, updateCustomer } from '../../api/customers.api';
import { Customer, CustomerStatus, CustomerType } from '../../types';

export function CustomerFormModal({
  customer,
  onClose,
  onSaved,
}: {
  customer?: Customer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(customer);
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    businessName: customer?.businessName || '',
    gstNumber: customer?.gstNumber || '',
    type: (customer?.type || 'RETAIL') as CustomerType,
    status: (customer?.status || 'LEAD') as CustomerStatus,
    followUpDate: customer?.followUpDate ? customer.followUpDate.slice(0, 10) : '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        followUpDate: form.followUpDate || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
      };
      if (isEdit && customer) {
        await updateCustomer(customer.id, payload);
      } else {
        await createCustomer(payload);
      }
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save customer';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Customer' : 'Add Customer'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-row">
          <Field label="Full Name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
        </div>

        <div className="form-row">
          <Field label="Email" hint="Optional">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Business Name" hint="Optional">
            <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </Field>
        </div>

        <Field label="Address" hint="Optional">
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter street address, city, state..." />
        </Field>

        <div className="form-row">
          <Field label="GST Number" hint="Optional">
            <Input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
          </Field>
          <Field label="Follow-up Date" hint="Optional">
            <Input
              type="date"
              value={form.followUpDate}
              onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
            />
          </Field>
        </div>

        <div className="form-row">
          <Field label="Customer Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CustomerType })}>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })}>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </Field>
        </div>

        {!isEdit && (
          <Field label="Initial Note" hint="Optional">
            <Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
        )}

        {error && <p className="field-error">{error}</p>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--paper-300)' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
