import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listCustomers } from '../api/customers.api';
import { listProducts } from '../api/products.api';
import { listChallans } from '../api/challans.api';
import { ChallanStatusBadge } from '../components/shared/StatusBadge';

export function Dashboard() {
  const customersQuery = useQuery({
    queryKey: ['dashboard-customers'],
    queryFn: () => listCustomers({ page: 1, limit: 1 }),
  });

  const lowStockQuery = useQuery({
    queryKey: ['dashboard-low-stock'],
    queryFn: () => listProducts({ page: 1, limit: 100, lowStock: true }),
  });

  const productsQuery = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => listProducts({ page: 1, limit: 1 }),
  });

  const recentChallansQuery = useQuery({
    queryKey: ['dashboard-challans'],
    queryFn: () => listChallans({ page: 1, limit: 8 }),
  });

  const todayChallans = (recentChallansQuery.data?.items || []).filter(
    (c) => new Date(c.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Operations Overview</h2>
          <p>A brass-eye view of today's ledger.</p>
        </div>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{customersQuery.data?.meta?.total ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{productsQuery.data?.meta?.total ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Items</div>
          <div className={`stat-value ${(lowStockQuery.data?.meta?.total ?? 0) > 0 ? 'warn' : ''}`}>
            {lowStockQuery.data?.meta?.total ?? '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Challans Today</div>
          <div className="stat-value">{todayChallans}</div>
        </div>
      </div>

      <div className="section-title">Recent Challans</div>
      <div className="ledger-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th>Challan #</th>
              <th>Customer</th>
              <th>Status</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(recentChallansQuery.data?.items || []).map((c) => (
              <tr key={c.id} onClick={() => (window.location.href = `/challans/${c.id}`)}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{c.challanNumber}</td>
                <td>{c.customer?.name}</td>
                <td>
                  <ChallanStatusBadge status={c.status} />
                </td>
                <td className="text-right">₹{Number(c.totalAmount).toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {!recentChallansQuery.isLoading && (recentChallansQuery.data?.items || []).length === 0 && (
              <tr>
                <td colSpan={4} className="ledger-empty">
                  No challans yet. <Link to="/challans/new">Create the first one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
