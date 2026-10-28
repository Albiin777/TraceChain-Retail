export type UserRole = 'RETAILER_OWNER' | 'STORE_MANAGER' | 'SALES_STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeName: string;
  avatarInitials: string;
}

export type StockStatus = 'normal' | 'near_expiry' | 'expired' | 'low_stock';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  uom: string; // Unit of measurement (e.g. 1L, 200g, Pack, Box)
  sellingPrice: number;
  costPrice: number;
  reorderThreshold: number;
  status: 'active' | 'inactive';
  minTempC?: number;
  maxTempC?: number;
  imageUrl?: string;
  description?: string;
}

export interface Batch {
  batchId: string;
  productId: string;
  productName: string;
  manufacturingDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  supplier: string;
  quantityReceived: number;
  quantitySold: number;
  quantityReturned: number;
  quantityWasted: number;
  availableQuantity: number;
  purchaseCost: number;
  retailPrice: number;
  currentCustodian: string;
  blockchainStatus: 'COMMITTED' | 'PENDING' | 'FAILED';
  txId: string;
  blockNumber: number;
  verifiedAt: string;
  status: StockStatus;
  daysRemaining: number;
  notes?: string;
  tempLogsCount?: number;
}

export interface StockMovement {
  id: string;
  batchId: string;
  productId: string;
  productName: string;
  type: 'RECEIPT' | 'SALE' | 'RETURN' | 'WASTAGE' | 'ADJUSTMENT';
  quantity: number;
  balanceAfter: number;
  timestamp: string;
  actor: string;
  reason: string;
  txId?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  discountAmount: number;
  finalUnitPrice: number;
  lineTotal: number;
  daysRemaining: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number; // 5% GST for dairy/groceries
  grandTotal: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
  paymentStatus: 'PAID' | 'REFUNDED' | 'CANCELLED';
  cashier: string;
  timestamp: string;
  customerName?: string;
  customerPhone?: string;
  blockchainTxId?: string;
}

export interface StorageLog {
  id: string;
  batchId: string;
  productId: string;
  temperatureC: number;
  timestamp: string;
  loggedBy: string;
  source: 'IOT_SENSOR' | 'MANUAL_ENTRY';
  isWithinLimits: boolean;
  notes?: string;
}

export interface LifecycleEvent {
  id: string;
  batchId: string;
  productId: string;
  eventType: 
    | 'PRODUCT_REGISTRATION'
    | 'MANUFACTURING'
    | 'PACKAGING'
    | 'QUALITY_INSPECTION'
    | 'DISPATCH_FROM_SUPPLIER'
    | 'TRANSIT_CUSTODY_TRANSFER'
    | 'RETAILER_RECEIPT'
    | 'STORAGE_CONDITION_LOG'
    | 'RETAIL_SALE'
    | 'WASTAGE_OR_DISPOSAL';
  timestamp: string;
  organization: string;
  actor: string;
  details: string;
  blockchainTxId: string;
  blockNumber: number;
  verificationStatus: 'VERIFIED_ON_CHAIN' | 'PENDING' | 'REJECTED';
  location?: string;
  metadata?: Record<string, any>;
}

export interface PricingRule {
  id: string;
  label: string;
  minDaysRemaining: number;
  maxDaysRemaining: number;
  discountPercentage: number;
  enabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'EXPIRY' | 'LOW_STOCK' | 'EXPIRED' | 'RECEIPT' | 'BLOCKCHAIN';
  severity: 'warning' | 'danger' | 'info' | 'success';
  timestamp: string;
  timeAgo: string;
  read: boolean;
  link?: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalProductsChange: string;
  activeBatches: number;
  activeBatchesChange: string;
  todaysSales: number;
  todaysSalesChange: string;
  totalStockValue: number;
  totalStockValueChange: string;
  lastUpdated: string;
}
