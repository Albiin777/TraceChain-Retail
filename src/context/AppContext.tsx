import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Product,
  Batch,
  LifecycleEvent,
  Sale,
  StorageLog,
  PricingRule,
  NotificationItem,
  User,
  DashboardMetrics,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_LIFECYCLE_EVENTS,
  INITIAL_STORAGE_LOGS,
  INITIAL_PRICING_RULES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SALES,
} from '../data/mockData';
import { determineBatchStatus, calculateDaysRemaining, formatINR } from '../utils/fefo';
import { fabricGateway } from '../services/fabricService';

interface AppContextType {
  user: User;
  setUser: (u: User) => void;
  products: Product[];
  batches: Batch[];
  lifecycleEvents: LifecycleEvent[];
  storageLogs: StorageLog[];
  pricingRules: PricingRule[];
  notifications: NotificationItem[];
  sales: Sale[];
  metrics: DashboardMetrics;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isQRScannerOpen: boolean;
  openQRScanner: (onScanned?: (code: string) => void) => void;
  closeQRScanner: () => void;
  qrScanCallback: ((code: string) => void) | null;
  receiveStock: (params: {
    batchId: string;
    productId: string;
    manufacturingDate: string;
    expiryDate: string;
    supplier: string;
    quantity: number;
    purchaseCost: number;
    retailPrice: number;
    deliveryRef: string;
    notes?: string;
  }) => Promise<{ success: boolean; txId: string; blockNumber: number }>;
  checkoutSale: (sale: Omit<Sale, 'id' | 'invoiceNumber' | 'blockchainTxId'>) => Promise<Sale>;
  logTemperature: (params: {
    batchId: string;
    productId: string;
    temperatureC: number;
    notes?: string;
    source: 'IOT_SENSOR' | 'MANUAL_ENTRY';
  }) => Promise<StorageLog>;
  recordWastageOrDisposal: (params: {
    batchId: string;
    quantity: number;
    reason: string;
  }) => Promise<{ success: boolean; txId: string }>;
  updatePricingRules: (rules: PricingRule[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: 'user-01',
    name: 'Albin Thomas',
    email: 'albin.thomas@greenmart.in',
    role: 'RETAILER_OWNER',
    storeName: 'GreenMart Store',
    avatarInitials: 'G',
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tc_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem('tc_batches');
    const raw: Batch[] = saved ? JSON.parse(saved) : INITIAL_BATCHES;
    return raw.map((b) => ({
      ...b,
      daysRemaining: calculateDaysRemaining(b.expiryDate),
      status: determineBatchStatus(b.expiryDate, b.availableQuantity),
    }));
  });

  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>(() => {
    const saved = localStorage.getItem('tc_lifecycle_events');
    return saved ? JSON.parse(saved) : INITIAL_LIFECYCLE_EVENTS;
  });

  const [storageLogs, setStorageLogs] = useState<StorageLog[]>(() => {
    const saved = localStorage.getItem('tc_storage_logs');
    return saved ? JSON.parse(saved) : INITIAL_STORAGE_LOGS;
  });

  const [pricingRules, setPricingRules] = useState<PricingRule[]>(() => {
    const saved = localStorage.getItem('tc_pricing_rules');
    return saved ? JSON.parse(saved) : INITIAL_PRICING_RULES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('tc_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('tc_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrScanCallback, setQrScanCallback] = useState<((code: string) => void) | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tc_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('tc_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('tc_lifecycle_events', JSON.stringify(lifecycleEvents));
  }, [lifecycleEvents]);

  useEffect(() => {
    localStorage.setItem('tc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('tc_pricing_rules', JSON.stringify(pricingRules));
  }, [pricingRules]);

  const openQRScanner = (onScanned?: (code: string) => void) => {
    setQrScanCallback(() => onScanned || null);
    setIsQRScannerOpen(true);
  };

  const closeQRScanner = () => {
    setIsQRScannerOpen(false);
    setQrScanCallback(null);
  };

  // Metrics calculation
  const metrics: DashboardMetrics = useMemo(() => {
    const extraSales = sales
      .filter((s) => s.timestamp.includes('2026-10-15') || s.timestamp.includes('Today'))
      .reduce((sum, s) => sum + s.grandTotal, 0);

    return {
      totalProducts: 142 + (products.length - INITIAL_PRODUCTS.length),
      totalProductsChange: '+12% vs last week',
      activeBatches: 328 + (batches.length - INITIAL_BATCHES.length),
      activeBatchesChange: '+8% vs last week',
      todaysSales: 12430 + Math.round(extraSales > 400 ? extraSales - 400 : 0),
      todaysSalesChange: '+15% vs yesterday',
      totalStockValue: 248900,
      totalStockValueChange: '+6% vs last month',
      lastUpdated: '5 mins ago',
    };
  }, [products, batches, sales]);

  const receiveStock = async (params: {
    batchId: string;
    productId: string;
    manufacturingDate: string;
    expiryDate: string;
    supplier: string;
    quantity: number;
    purchaseCost: number;
    retailPrice: number;
    deliveryRef: string;
    notes?: string;
  }) => {
    const prod = products.find((p) => p.id === params.productId);
    const prodName = prod ? prod.name : 'Stock Item';

    // Submit to Fabric Gateway
    const commit = await fabricGateway.submitTransaction('ConfirmReceipt', {
      batchId: params.batchId,
      productId: params.productId,
      quantity: params.quantity,
      deliveryRef: params.deliveryRef,
      custodian: user.storeName,
    });

    const daysRemaining = calculateDaysRemaining(params.expiryDate);
    const status = determineBatchStatus(params.expiryDate, params.quantity);

    const existingIndex = batches.findIndex((b) => b.batchId.toLowerCase() === params.batchId.toLowerCase());
    let updatedBatches: Batch[];

    if (existingIndex >= 0) {
      const existing = batches[existingIndex];
      const updated: Batch = {
        ...existing,
        quantityReceived: existing.quantityReceived + params.quantity,
        availableQuantity: existing.availableQuantity + params.quantity,
        status: determineBatchStatus(existing.expiryDate, existing.availableQuantity + params.quantity),
        txId: commit.txId,
        blockNumber: commit.blockNumber,
        verifiedAt: new Date().toLocaleString('en-IN') + ' IST',
      };
      updatedBatches = [...batches];
      updatedBatches[existingIndex] = updated;
    } else {
      const newBatch: Batch = {
        batchId: params.batchId,
        productId: params.productId,
        productName: prodName,
        manufacturingDate: params.manufacturingDate,
        expiryDate: params.expiryDate,
        supplier: params.supplier,
        quantityReceived: params.quantity,
        quantitySold: 0,
        quantityReturned: 0,
        quantityWasted: 0,
        availableQuantity: params.quantity,
        purchaseCost: params.purchaseCost,
        retailPrice: params.retailPrice,
        currentCustodian: user.storeName,
        blockchainStatus: 'COMMITTED',
        txId: commit.txId,
        blockNumber: commit.blockNumber,
        verifiedAt: new Date().toLocaleString('en-IN') + ' IST',
        status,
        daysRemaining,
        notes: params.notes || `Received with delivery challan #${params.deliveryRef}`,
        tempLogsCount: 1,
      };
      updatedBatches = [newBatch, ...batches];
    }

    setBatches(updatedBatches);

    // Record lifecycle event
    const newEvent: LifecycleEvent = {
      id: `evt-${Date.now()}`,
      batchId: params.batchId,
      productId: params.productId,
      eventType: 'RETAILER_RECEIPT',
      timestamp: new Date().toLocaleString('en-IN') + ' IST',
      organization: `${user.storeName} (RetailerMSP)`,
      actor: `${user.name} (${user.role.replace('_', ' ')})`,
      details: `Received ${params.quantity} units from ${params.supplier}. Challan #${params.deliveryRef}. ${params.notes || ''}`,
      blockchainTxId: commit.txId,
      blockNumber: commit.blockNumber,
      verificationStatus: 'VERIFIED_ON_CHAIN',
      location: `${user.storeName} Receiving Bay`,
    };
    setLifecycleEvents((prev) => [newEvent, ...prev]);

    // Push notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Stock Received: ${params.batchId}`,
      description: `${params.quantity} units of ${prodName} added to inventory. Ledger verified.`,
      type: 'RECEIPT',
      severity: 'success',
      timestamp: new Date().toLocaleTimeString('en-IN') + ' IST',
      timeAgo: 'Just now',
      read: false,
      link: `/batches/${params.batchId}`,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true, txId: commit.txId, blockNumber: commit.blockNumber };
  };

  const checkoutSale = async (saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'blockchainTxId'>) => {
    // Generate invoice #
    const invoiceNumber = `INV-2026-${1050 + sales.length}`;
    const commit = await fabricGateway.submitTransaction('RecordSale', {
      invoiceNumber,
      itemCount: saleData.items.length,
      grandTotal: saleData.grandTotal,
      cashier: saleData.cashier,
    });

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNumber,
      blockchainTxId: commit.txId,
    };

    // Deduct stock from each batch
    setBatches((prevBatches) => {
      const copy = [...prevBatches];
      for (const item of saleData.items) {
        const batchIndex = copy.findIndex((b) => b.batchId === item.batchId);
        if (batchIndex >= 0) {
          const b = copy[batchIndex];
          const newAvail = Math.max(0, b.availableQuantity - item.quantity);
          copy[batchIndex] = {
            ...b,
            availableQuantity: newAvail,
            quantitySold: b.quantitySold + item.quantity,
            status: determineBatchStatus(b.expiryDate, newAvail),
          };
        }
      }
      return copy;
    });

    // Add sales lifecycle events for involved batches
    const saleEvents: LifecycleEvent[] = saleData.items.map((item, idx) => ({
      id: `evt-sale-${Date.now()}-${idx}`,
      batchId: item.batchId,
      productId: item.productId,
      eventType: 'RETAIL_SALE',
      timestamp: new Date().toLocaleString('en-IN') + ' IST',
      organization: `${user.storeName} (RetailerMSP)`,
      actor: `${saleData.cashier} (POS Terminal)`,
      details: `${item.quantity} units sold under Invoice #${invoiceNumber}. Final price: ${formatINR(item.finalUnitPrice)}.`,
      blockchainTxId: commit.txId,
      blockNumber: commit.blockNumber,
      verificationStatus: 'VERIFIED_ON_CHAIN',
      location: 'Checkout Lane 1',
    }));

    setLifecycleEvents((prev) => [...saleEvents, ...prev]);
    setSales((prev) => [newSale, ...prev]);

    return newSale;
  };

  const logTemperature = async (params: {
    batchId: string;
    productId: string;
    temperatureC: number;
    notes?: string;
    source: 'IOT_SENSOR' | 'MANUAL_ENTRY';
  }) => {
    const prod = products.find((p) => p.id === params.productId);
    const minT = prod?.minTempC ?? 2;
    const maxT = prod?.maxTempC ?? 8;
    const isWithinLimits = params.temperatureC >= minT && params.temperatureC <= maxT;

    const commit = await fabricGateway.submitTransaction('RecordStorageCondition', {
      batchId: params.batchId,
      temperatureC: params.temperatureC,
      isWithinLimits,
      source: params.source,
    });

    const newLog: StorageLog = {
      id: `slog-${Date.now()}`,
      batchId: params.batchId,
      productId: params.productId,
      temperatureC: params.temperatureC,
      timestamp: new Date().toLocaleString('en-IN') + ' IST',
      loggedBy: `${user.name} (${params.source === 'IOT_SENSOR' ? 'Telemetry' : 'Manual Probe'})`,
      source: params.source,
      isWithinLimits,
      notes: params.notes,
    };

    setStorageLogs((prev) => [newLog, ...prev]);

    // Record lifecycle event
    const event: LifecycleEvent = {
      id: `evt-temp-${Date.now()}`,
      batchId: params.batchId,
      productId: params.productId,
      eventType: 'STORAGE_CONDITION_LOG',
      timestamp: new Date().toLocaleString('en-IN') + ' IST',
      organization: `${user.storeName} (RetailerMSP)`,
      actor: newLog.loggedBy,
      details: `Storage temperature measured at ${params.temperatureC}°C (${isWithinLimits ? 'Compliant with limits' : 'WARNING: Breach of storage limits!'}).`,
      blockchainTxId: commit.txId,
      blockNumber: commit.blockNumber,
      verificationStatus: 'VERIFIED_ON_CHAIN',
      location: 'Chiller Bay',
    };
    setLifecycleEvents((prev) => [event, ...prev]);

    if (!isWithinLimits) {
      const alertNotif: NotificationItem = {
        id: `notif-breach-${Date.now()}`,
        title: `Temperature Breach Alert: Batch ${params.batchId}`,
        description: `Measured ${params.temperatureC}°C, outside safe range (${minT}°C - ${maxT}°C). Check chiller.`,
        type: 'EXPIRY',
        severity: 'danger',
        timestamp: 'Just now',
        timeAgo: 'Just now',
        read: false,
        link: `/batches/${params.batchId}`,
      };
      setNotifications((prev) => [alertNotif, ...prev]);
    }

    return newLog;
  };

  const recordWastageOrDisposal = async (params: { batchId: string; quantity: number; reason: string }) => {
    const commit = await fabricGateway.submitTransaction('RecordDisposal', {
      batchId: params.batchId,
      quantity: params.quantity,
      reason: params.reason,
      actor: user.name,
    });

    setBatches((prev) =>
      prev.map((b) => {
        if (b.batchId === params.batchId) {
          const newAvail = Math.max(0, b.availableQuantity - params.quantity);
          return {
            ...b,
            availableQuantity: newAvail,
            quantityWasted: b.quantityWasted + params.quantity,
            status: determineBatchStatus(b.expiryDate, newAvail),
            notes: `Disposal recorded: ${params.quantity} units for "${params.reason}"`,
          };
        }
        return b;
      })
    );

    const b = batches.find((x) => x.batchId === params.batchId);
    const event: LifecycleEvent = {
      id: `evt-waste-${Date.now()}`,
      batchId: params.batchId,
      productId: b ? b.productId : 'prod-unknown',
      eventType: 'WASTAGE_OR_DISPOSAL',
      timestamp: new Date().toLocaleString('en-IN') + ' IST',
      organization: `${user.storeName} (RetailerMSP)`,
      actor: `${user.name} (${user.role})`,
      details: `Disposal of ${params.quantity} units. Reason: ${params.reason}. Removed from active sale.`,
      blockchainTxId: commit.txId,
      blockNumber: commit.blockNumber,
      verificationStatus: 'VERIFIED_ON_CHAIN',
      location: 'Quarantine & Disposal Area',
    };

    setLifecycleEvents((prev) => [event, ...prev]);
    return { success: true, txId: commit.txId };
  };

  const updatePricingRules = (rules: PricingRule[]) => {
    setPricingRules(rules);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...p,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (p: Product) => {
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        products,
        batches,
        lifecycleEvents,
        storageLogs,
        pricingRules,
        notifications,
        sales,
        metrics,
        searchQuery,
        setSearchQuery,
        isQRScannerOpen,
        openQRScanner,
        closeQRScanner,
        qrScanCallback,
        receiveStock,
        checkoutSale,
        logTemperature,
        recordWastageOrDisposal,
        updatePricingRules,
        markNotificationAsRead,
        markAllNotificationsRead,
        addProduct,
        updateProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
