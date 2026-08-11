import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listProducts } from '../../api/products.api';
import { useDebouncedValue } from '../../hooks/useDebouncedSearch';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/FormControls';
import { LowStockBadge } from '../../components/shared/StatusBadge';
import { PaginationBar } from '../../components/shared/PaginationBar';
import { ProductFormModal } from './ProductForm';
import { useAuth } from '../../auth/AuthContext';
import { Product } from '../../types';
import { exportToCSV } from '../../utils/csvExporter';

export function ProductList() {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [modalProduct, setModalProduct] = useState<Product | 'new' | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['products', debouncedSearch, lowStockOnly, page],
    queryFn: () => listProducts({ search: debouncedSearch || undefined, lowStock: lowStockOnly || undefined, page, limit: 10 }),
  });

  function onSaved() {
    setModalProduct(null);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success('Product saved');
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Inventory Register</h2>
          <p>Stock levels across every warehouse.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="ghost"
            onClick={() =>
              exportToCSV(
                (data?.items || []).map((p) => ({
                  Name: p.name,
                  SKU: p.sku,
                  Category: p.category,
                  Warehouse: p.warehouse,
                  Price: p.price,
                  Stock: p.stock,
                  MinStock: p.minStock,
                })),
                'Inventory_Register'
              )
            }
          >
            Export CSV
          </Button>
          {canManage && (
            <Button variant="brass" onClick={() => setModalProduct('new')}>
              + Add Product
            </Button>
          )}
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <Input
            placeholder="Search name, SKU, category…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(1);
            }}
          />
          Low stock only
        </label>
      </div>

      <div className="ledger-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Warehouse</th>
              <th className="text-right">Price</th>
              <th className="text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((p) => (
              <tr key={p.id} onClick={() => canManage && setModalProduct(p)}>
                <td>
                  <Link to={`/products/${p.id}`} onClick={(e) => e.stopPropagation()}>
                    {p.name}
                  </Link>
                </td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td>{p.warehouse}</td>
                <td className="text-right">₹{Number(p.price).toLocaleString('en-IN')}</td>
                <td className="text-right">
                  {p.stock} {p.stock <= p.minStock && <LowStockBadge />}
                </td>
              </tr>
            ))}
            {!isLoading && (data?.items || []).length === 0 && (
              <tr>
                <td colSpan={6} className="ledger-empty">
                  No products match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <PaginationBar meta={data?.meta} onPageChange={setPage} />
      </div>

      {modalProduct && (
        <ProductFormModal
          product={modalProduct === 'new' ? undefined : modalProduct}
          onClose={() => setModalProduct(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
