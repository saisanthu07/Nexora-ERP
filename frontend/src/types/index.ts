export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'LEAD';

export interface Note {
  id: string;
  customerId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  type: CustomerType;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string | number;
  stock: number;
  minStock: number;
  warehouse: string;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  refType?: string | null;
  refId?: string | null;
  createdBy: string;
  createdAt: string;
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  priceSnapshot: string | number;
  quantity: number;
  lineTotal: string | number;
  product?: { id: string; name: string; sku: string };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: { id: string; name: string; phone: string; businessName?: string | null; address?: string | null };
  status: ChallanStatus;
  items: ChallanItem[];
  totalQuantity: number;
  totalAmount: string | number;
  createdById: string;
  createdBy?: { id: string; name: string };
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string };
}
