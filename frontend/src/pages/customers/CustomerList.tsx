import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listCustomers } from '../../api/customers.api';
import { useDebouncedValue } from '../../hooks/useDebouncedSearch';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/FormControls';
import { CustomerStatusBadge } from '../../components/shared/StatusBadge';
import { PaginationBar } from '../../components/shared/PaginationBar';
import { CustomerFormModal } from './CustomerForm';
import { Customer } from '../../types';
import { exportToCSV } from '../../utils/csvExporter';

export function CustomerList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modalCustomer, setModalCustomer] = useState<Customer | 'new' | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', debouncedSearch, status, page],
    queryFn: () => listCustomers({ search: debouncedSearch || undefined, status: status || undefined, page, limit: 10 }),
  });

  function onSaved() {
    setModalCustomer(null);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    toast.success('Customer saved');
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Customer Ledger</h2>
          <p>Every account, every follow-up, in one leather-bound register.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="ghost"
            onClick={() =>
              exportToCSV(
                (data?.items || []).map((c) => ({
                  Name: c.name,
                  Phone: c.phone,
                  Email: c.email || '',
                  Address: c.address || '',
                  BusinessName: c.businessName || '',
                  GST: c.gstNumber || '',
                  Type: c.type,
                  Status: c.status,
                  FollowUpDate: c.followUpDate || '',
                })),
                'Customer_Ledger'
              )
            }
          >
            📊 Export CSV
          </Button>
          <Button variant="brass" onClick={() => setModalCustomer('new')}>
            + Add Customer
          </Button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <Input
            placeholder="Search name, phone, business…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 160 }}
          >
            <option value="">All statuses</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </div>

      <div className="ledger-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Status</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((c) => (
              <tr key={c.id} onClick={() => setModalCustomer(c)}>
                <td>
                  <Link to={`/customers/${c.id}`} onClick={(e) => e.stopPropagation()}>
                    {c.name}
                  </Link>
                </td>
                <td>{c.businessName || '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{c.phone}</td>
                <td>{c.type}</td>
                <td>
                  <CustomerStatusBadge status={c.status} />
                </td>
                <td>{c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {!isLoading && (data?.items || []).length === 0 && (
              <tr>
                <td colSpan={6} className="ledger-empty">
                  No customers match. Try clearing filters or add a new one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <PaginationBar meta={data?.meta} onPageChange={setPage} />
      </div>

      {modalCustomer && (
        <CustomerFormModal
          customer={modalCustomer === 'new' ? undefined : modalCustomer}
          onClose={() => setModalCustomer(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
