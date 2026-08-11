import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { listCustomers } from '../api/customers.api';
import { listProducts } from '../api/products.api';
import { listChallans } from '../api/challans.api';
import { ChallanStatusBadge } from '../components/shared/StatusBadge';

export function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'SALES';

  const customersQuery = useQuery({
    queryKey: ['dashboard-customers'],
    queryFn: () => listCustomers({ page: 1, limit: 100 }),
  });

  const lowStockQuery = useQuery({
    queryKey: ['dashboard-low-stock'],
    queryFn: () => listProducts({ page: 1, limit: 100, lowStock: true }),
  });

  const productsQuery = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => listProducts({ page: 1, limit: 100 }),
  });

  const recentChallansQuery = useQuery({
    queryKey: ['dashboard-challans'],
    queryFn: () => listChallans({ page: 1, limit: 10 }),
  });

  const customers = customersQuery.data?.items || [];
  const products = productsQuery.data?.items || [];
  const challans = recentChallansQuery.data?.items || [];

  const todayChallans = challans.filter(
    (c) => new Date(c.createdAt).toDateString() === new Date().toDateString()
  );

  const confirmedChallans = challans.filter((c) => c.status === 'CONFIRMED');
  const totalRevenue = confirmedChallans.reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);
  const leadsCount = customers.filter((c) => c.status === 'LEAD').length;
  const activeCustomersCount = customers.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>
            {role === 'ADMIN' && '👑 Executive & Operations Portal'}
            {role === 'SALES' && '🎯 Sales CRM & Pipeline Dashboard'}
            {role === 'WAREHOUSE' && '📦 Stock & Inventory Control Center'}
            {role === 'ACCOUNTS' && '💼 Accounts & Ledger Workspace'}
          </h2>
          <p>
            Welcome back, <strong>{user?.name}</strong>! Tailored view for your <strong>{role}</strong> role.
          </p>
        </div>
        {['ADMIN', 'SALES'].includes(role) && (
          <Link to="/challans/new" className="btn btn-primary">
            + New Sales Challan
          </Link>
        )}
      </div>

      {/* Role-tailored Stat Cards */}
      <div className="card-grid">
        {role === 'ADMIN' && (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Customers</div>
              <div className="stat-value">{customersQuery.data?.meta?.total ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Low Stock Alerts</div>
              <div className={`stat-value ${(lowStockQuery.data?.meta?.total ?? 0) > 0 ? 'warn' : ''}`}>
                {lowStockQuery.data?.meta?.total ?? '—'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Challans Today</div>
              <div className="stat-value">{todayChallans.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Confirmed Revenue</div>
              <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
            </div>
          </>
        )}

        {role === 'SALES' && (
          <>
            <div className="stat-card">
              <div className="stat-label">Active Customers</div>
              <div className="stat-value">{activeCustomersCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">New Leads</div>
              <div className="stat-value" style={{ color: 'var(--brand-600)' }}>{leadsCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">My Sales Today</div>
              <div className="stat-value">{todayChallans.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Sales Revenue</div>
              <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
            </div>
          </>
        )}

        {role === 'WAREHOUSE' && (
          <>
            <div className="stat-card">
              <div className="stat-label">Total SKUs Managed</div>
              <div className="stat-value">{productsQuery.data?.meta?.total ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Low Stock Warnings</div>
              <div className={`stat-value ${(lowStockQuery.data?.meta?.total ?? 0) > 0 ? 'warn' : ''}`}>
                {lowStockQuery.data?.meta?.total ?? '—'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Stock Out Today</div>
              <div className="stat-value">{todayChallans.filter((c) => c.status === 'CONFIRMED').length} Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Draft Orders Pending</div>
              <div className="stat-value">{challans.filter((c) => c.status === 'DRAFT').length}</div>
            </div>
          </>
        )}

        {role === 'ACCOUNTS' && (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Customer Accounts</div>
              <div className="stat-value">{customersQuery.data?.meta?.total ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Confirmed Invoices</div>
              <div className="stat-value">{confirmedChallans.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Billed Amount</div>
              <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Draft (Unbilled)</div>
              <div className="stat-value">{challans.filter((c) => c.status === 'DRAFT').length}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
        {/* Left Section: Contextual Priority Table */}
        <div>
          {role === 'WAREHOUSE' ? (
            <>
              <div className="section-title">⚠️ Priority Low Stock Alerts</div>
              <div className="ledger-wrap">
                <table className="ledger">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Warehouse</th>
                      <th className="text-right">Stock (Min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lowStockQuery.data?.items || []).slice(0, 7).map((p) => (
                      <tr key={p.id} onClick={() => (window.location.href = `/products/${p.id}`)}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.sku}</td>
                        <td>{p.warehouse || 'Main WH'}</td>
                        <td className="text-right" style={{ color: 'var(--crimson-600)', fontWeight: 700 }}>
                          {p.stock} / ({p.minStock})
                        </td>
                      </tr>
                    ))}
                    {!lowStockQuery.isLoading && (lowStockQuery.data?.items || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="ledger-empty">
                          All products are healthy above stock minimums!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : role === 'SALES' ? (
            <>
              <div className="section-title">👥 Follow-up Required & Recent Leads</div>
              <div className="ledger-wrap">
                <table className="ledger">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Follow-Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.slice(0, 7).map((c) => (
                      <tr key={c.id} onClick={() => (window.location.href = `/customers/${c.id}`)}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.type}</td>
                        <td>
                          <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : 'None'}
                        </td>
                      </tr>
                    ))}
                    {!customersQuery.isLoading && customers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="ledger-empty">
                          No customer leads yet. <Link to="/customers">Add customer →</Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="section-title">📋 Recent Sales Challans</div>
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
                    {challans.map((c) => (
                      <tr key={c.id} onClick={() => (window.location.href = `/challans/${c.id}`)}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{c.challanNumber}</td>
                        <td>{c.customer?.name}</td>
                        <td>
                          <ChallanStatusBadge status={c.status} />
                        </td>
                        <td className="text-right">₹{Number(c.totalAmount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    {!recentChallansQuery.isLoading && challans.length === 0 && (
                      <tr>
                        <td colSpan={4} className="ledger-empty">
                          No challans yet. <Link to="/challans/new">Create the first one →</Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Right Section: System Activity / Audit Feed */}
        <div>
          <div className="section-title">⚡ Operational Activity Feed</div>
          <div className="paper-card" style={{ maxHeight: 380, overflowY: 'auto' }}>
            {challans.map((c) => (
              <div key={`audit-${c.id}`} className="note-item" style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--paper-300)' }}>
                <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                  {c.status === 'CONFIRMED' ? '✅ Stock Reduced & Confirmed' : c.status === 'DRAFT' ? '📝 Sales Draft Created' : '❌ Challan Cancelled'}
                </span>
                <div>
                  Challan <strong>{c.challanNumber}</strong> for {c.customer?.name || 'Customer'} (₹{Number(c.totalAmount).toLocaleString('en-IN')})
                </div>
                <div className="note-meta">{new Date(c.createdAt).toLocaleString()} · By {c.createdBy?.name || 'System'}</div>
              </div>
            ))}
            {!recentChallansQuery.isLoading && challans.length === 0 && (
              <div style={{ color: 'var(--paper-600)', fontStyle: 'italic' }}>No system activity recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

