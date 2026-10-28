import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Package,
  Layers,
  Thermometer,
  ShieldCheck,
  Plus,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

export const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { products, batches, lifecycleEvents, openQRScanner } = useApp();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto">
        <Package size={48} className="mx-auto text-[#7E7469] mb-4" />
        <h2 className="text-xl font-bold text-[#1B1713]">Product Not Found</h2>
        <p className="text-sm text-[#7E7469] mt-1">
          The requested product ID does not exist in the catalog.
        </p>
        <button
          onClick={() => navigate('/inventory')}
          className="mt-4 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Inventory
        </button>
      </div>
    );
  }

  // Find all batches for this product
  const productBatches = batches.filter((b) => b.productId === product.id);
  const totalStock = productBatches
    .filter((b) => b.daysRemaining > 0)
    .reduce((sum, b) => sum + b.availableQuantity, 0);

  // Relevant lifecycle events
  const productEvents = lifecycleEvents.filter((e) => e.productId === product.id);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inventory')}
            className="rounded-xl border border-[#D5C6B5] bg-white p-2 text-[#3E2B22] hover:bg-[#F6F2EA] transition"
            aria-label="Back to inventory"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">{product.name}</h1>
              <span className="rounded-full bg-[#EBF3EA] px-2.5 py-0.5 text-xs font-semibold text-[#4F7A38]">
                {product.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[#7E7469] font-mono mt-0.5">
              SKU: {product.sku} • Category: {product.category} • Brand: {product.brand}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/receive-stock?productId=${product.id}`)}
            className="flex items-center gap-1.5 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2A1D17] transition"
          >
            <Plus size={15} />
            <span>Receive New Batch</span>
          </button>
          <button
            onClick={() => navigate(`/sales/new?productId=${product.id}`)}
            className="flex items-center gap-1.5 rounded-xl border border-[#6B734A] bg-[#6B734A]/10 px-4 py-2 text-xs font-semibold text-[#6B734A] hover:bg-[#6B734A]/20 transition"
          >
            <ShoppingCart size={15} />
            <span>Bill Product</span>
          </button>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Retail Selling Price</span>
          <p className="text-2xl font-bold text-[#1B1713] mt-1">{formatINR(product.sellingPrice)}</p>
          <p className="text-[11px] text-[#4F7A38] mt-1">Cost: {formatINR(product.costPrice)}</p>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Total Available Stock</span>
          <p className="text-2xl font-bold text-[#1B1713] mt-1">{totalStock}</p>
          <p className="text-[11px] text-[#7E7469] mt-1">Reorder Level: {product.reorderThreshold}</p>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Cold Chain Storage Range</span>
          <p className="text-xl font-bold text-[#1B1713] mt-1">
            {product.minTempC ?? 2}°C to {product.maxTempC ?? 8}°C
          </p>
          <div className="flex items-center gap-1 text-[11px] text-[#4F7A38] mt-1">
            <Thermometer size={12} />
            <span>Refrigerated Zone</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Consortium Blockchain Status</span>
          <div className="flex items-center gap-1.5 mt-2 text-sm font-bold text-[#4F7A38]">
            <ShieldCheck size={18} />
            <span>Ledger Anchored</span>
          </div>
          <p className="text-[11px] text-[#7E7469] mt-1">Channel: #foodtrace</p>
        </div>
      </div>

      {/* Batches Table */}
      <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1B1713]">
            Batches in Custody ({productBatches.length})
          </h2>
          <span className="text-xs text-[#7E7469]">Prioritized according to FEFO protocol</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#EADDD0] text-[#7E7469] font-semibold">
              <tr>
                <th className="pb-3">Batch ID</th>
                <th className="pb-3">Supplier</th>
                <th className="pb-3">Mfg Date</th>
                <th className="pb-3">Expiry Date</th>
                <th className="pb-3 text-center">Days Left</th>
                <th className="pb-3 text-center">Stock</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {productBatches.map((b) => (
                <tr key={b.batchId} className="hover:bg-[#F6F2EA]/60 transition">
                  <td className="py-3 font-mono font-bold text-[#1B1713]">{b.batchId}</td>
                  <td className="py-3 text-[#7E7469]">{b.supplier}</td>
                  <td className="py-3 text-[#7E7469]">{b.manufacturingDate}</td>
                  <td className="py-3 font-medium text-[#1B1713]">{b.expiryDate}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${
                        b.daysRemaining <= 0
                          ? 'bg-red-100 text-red-700'
                          : b.daysRemaining <= 3
                          ? 'bg-red-50 text-red-600'
                          : b.daysRemaining <= 7
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {b.daysRemaining}
                    </span>
                  </td>
                  <td className="py-3 text-center font-bold text-[#1B1713]">{b.availableQuantity}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        b.status === 'expired'
                          ? 'bg-red-100 text-red-700'
                          : b.status === 'near_expiry'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => navigate(`/batches/${b.batchId}`)}
                      className="rounded-xl border border-[#D5C6B5] bg-white px-3 py-1 font-medium text-[#1B1713] hover:bg-[#F6F2EA]"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
