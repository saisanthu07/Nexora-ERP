import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal';
import { Field, Input } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { createProduct, updateProduct } from '../../api/products.api';
import { Product } from '../../types';

export function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    price: product ? String(product.price) : '',
    stock: product ? String(product.stock) : '0',
    minStock: product ? String(product.minStock) : '0',
    warehouse: product?.warehouse || '',
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
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
      };
      if (isEdit && product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save product';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Product' : 'Add Product'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Field label="Product Name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="SKU">
            <Input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Field>
        </div>

        <div className="form-row">
          <Field label="Category">
            <Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </Field>
          <Field label="Warehouse">
            <Input required value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} />
          </Field>
        </div>

        <div className="form-row">
          <Field label="Price (₹)">
            <Input type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </Field>
          <Field label="Min Stock Threshold">
            <Input type="number" min="0" required value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
          </Field>
        </div>

        {!isEdit && (
          <Field label="Opening Stock" hint="Initial stock quantity — adjust later via stock movements">
            <Input type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </Field>
        )}

        {error && <p className="field-error">{error}</p>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
