import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerDetail } from './pages/customers/CustomerDetail';
import { ProductList } from './pages/products/ProductList';
import { StockMovementLog } from './pages/products/StockMovementLog';
import { ChallanList } from './pages/challans/ChallanList';
import { ChallanCreate } from './pages/challans/ChallanCreate';
import { ChallanDetail } from './pages/challans/ChallanDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 13,
                borderRadius: 8,
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />

              <Route
                path="/customers"
                element={
                  <ProtectedRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                    <CustomerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/:id"
                element={
                  <ProtectedRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}>
                    <CustomerDetail />
                  </ProtectedRoute>
                }
              />

              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<StockMovementLog />} />

              <Route
                path="/challans"
                element={
                  <ProtectedRoute roles={['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']}>
                    <ChallanList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challans/new"
                element={
                  <ProtectedRoute roles={['ADMIN', 'SALES']}>
                    <ChallanCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challans/:id"
                element={
                  <ProtectedRoute roles={['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']}>
                    <ChallanDetail />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
