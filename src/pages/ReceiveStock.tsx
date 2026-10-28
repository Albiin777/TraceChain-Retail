import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  PackagePlus,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

export const ReceiveStock: React.FC = () => {
  const { products, batches, receiveStock, openQRScanner, user } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedProductId = searchParams.get('productId') || products[0]?.id || '';

  const [formData, setFormData] = useState({
    batchId: `TCM00${Math.floor(1000 + Math.random() * 9000)}`,
    productId: preselectedProductId,
    supplier: 'Amul Dairy Cooperative Ltd',
    manufacturingDate: '2026-10-14',
    expiryDate: '2026-10-24',
    quantity: 50,
    purchaseCost: 42,
    retailPrice: 50,
    deliveryRef: `DC-AMUL-${Math.floor(1000 + Math.random() * 9000)}`,
    coldChainVerified: true,
    transitTempC: 3.6,
    remarks: 'Transit seals intact. Cold-chain probe within permissible 2°C - 6°C range.',
  });

  const [submitting, setSubmitting] = useState(false);
  const [commitResult, setCommitResult] = useState<{
    txId: string;
    blockNumber: number;
    batchId: string;
  } | null>(null);

  // Auto-sync retail price when product changes
  useEffect(() => {
    const selectedProd = products.find((p) => p.id === formData.productId);
    if (selectedProd) {
      setFormData((prev) => ({
        ...prev,
        retailPrice: selectedProd.sellingPrice,
        purchaseCost: selectedProd.costPrice,
      }));
    }
  }, [formData.productId, products]);

  const handleQRScanFill = (scannedBatchId: string) => {
    const existing = batches.find((b) => b.batchId.toLowerCase() === scannedBatchId.toLowerCase());
    if (existing) {
      setFormData((prev) => ({
        ...prev,
        batchId: existing.batchId,
        productId: existing.productId,
        supplier: existing.supplier,
        manufacturingDate: existing.manufacturingDate,
        expiryDate: existing.expiryDate,
        quantity: 30,
        purchaseCost: existing.purchaseCost,
        retailPrice: existing.retailPrice,
      }));
    } else {
      setFormData((prev) => ({ ...prev, batchId: scannedBatchId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId || formData.quantity <= 0) return;

    setSubmitting(true);
    try {
      const res = await receiveStock({
        batchId: formData.batchId,
        productId: formData.productId,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
        supplier: formData.supplier,
        quantity: Number(formData.quantity),
        purchaseCost: Number(formData.purchaseCost),
        retailPrice: Number(formData.retailPrice),
        deliveryRef: formData.deliveryRef,
        notes: `${formData.remarks} [Transit Temp: ${formData.transitTempC}°C]`,
      });

      setCommitResult({
        txId: res.txId,
        blockNumber: res.blockNumber,
        batchId: formData.batchId,
      });
    } catch (err) {
      console.error('Stock receipt failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">Receive Inbound Stock</h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Verify dispatch documentation, log cold-chain transit conditions, and confirm custody transfer on Hyperledger Fabric.
          </p>
        </div>

        <button
          onClick={() => openQRScanner(handleQRScanFill)}
          className="flex items-center gap-2 rounded-xl border border-[#D5C6B5] bg-white px-4 py-2 text-xs font-semibold text-[#1B1713] shadow-2xs hover:bg-[#F6F2EA] transition"
        >
          <QrCode size={16} className="text-[#3E2B22]" />
          <span>Scan Dispatch Challan QR</span>
        </button>
      </div>

      {commitResult ? (
        /* Success Screen */
        <div className="rounded-3xl border border-[#CCE0C7] bg-[#EBF3EA] p-8 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4F7A38] text-white">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#1B1713]">
            Custody Transfer Confirmed &amp; Committed
          </h2>
          <p className="text-xs text-[#556942] max-w-md mx-auto">
            Batch #{commitResult.batchId} has been successfully registered into GreenMart Store inventory and validated by the consortium endorsing peers.
          </p>

          <div className="mx-auto max-w-lg rounded-2xl border border-[#CCE0C7] bg-white p-4 text-left font-mono text-xs space-y-1.5 shadow-2xs">
            <div className="flex justify-between text-[#7E7469]">
              <span>Blockchain Status:</span>
              <span className="font-bold text-[#4F7A38]">COMMITTED (Raft Consensus)</span>
            </div>
            <div className="flex justify-between text-[#7E7469]">
              <span>Block Height:</span>
              <span className="font-bold text-[#1B1713]">#{commitResult.blockNumber}</span>
            </div>
            <div className="flex justify-between text-[#7E7469]">
              <span>Transaction ID:</span>
              <span className="truncate max-w-[240px] text-[#1B1713]">{commitResult.txId}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setCommitResult(null);
                setFormData((prev) => ({
                  ...prev,
                  batchId: `TCM00${Math.floor(1000 + Math.random() * 9000)}`,
                  deliveryRef: `DC-AMUL-${Math.floor(1000 + Math.random() * 9000)}`,
                }));
              }}
              className="rounded-xl border border-[#D5C6B5] bg-white px-4 py-2 text-xs font-semibold text-[#1B1713] hover:bg-[#F6F2EA]"
            >
              Receive Another Batch
            </button>
            <button
              onClick={() => navigate(`/batches/${commitResult.batchId}`)}
              className="flex items-center gap-1.5 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2A1D17]"
            >
              <span>View Batch Tracking</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Batch Identification */}
            <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F0E6D8] pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3E2B22] text-xs font-bold text-white">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#1B1713]">Batch &amp; Dispatch Information</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Batch Identifier (Serial #) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  placeholder="e.g. TCM002451"
                  className="w-full rounded-xl border border-[#D5C6B5] px-3.5 py-2 text-xs font-mono font-medium text-[#1B1713] focus:border-[#6B734A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Catalog Product *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs text-[#1B1713] focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Retail: ₹{p.sellingPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Authorized Supplier Organization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full rounded-xl border border-[#D5C6B5] px-3.5 py-2 text-xs text-[#1B1713] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Delivery Challan / Transit Bill # *
                </label>
                <input
                  type="text"
                  required
                  value={formData.deliveryRef}
                  onChange={(e) => setFormData({ ...formData, deliveryRef: e.target.value })}
                  className="w-full rounded-xl border border-[#D5C6B5] px-3.5 py-2 text-xs text-[#1B1713] focus:outline-none"
                />
              </div>
            </div>

            {/* Step 2: Quality & Shelf Life Verification */}
            <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F0E6D8] pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3E2B22] text-xs font-bold text-white">
                  2
                </span>
                <h2 className="text-sm font-bold text-[#1B1713]">Quantity, Dates &amp; Cold Chain</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.manufacturingDate}
                    onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs text-[#1B1713]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs text-[#1B1713]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Units Received *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs font-bold text-[#1B1713]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs text-[#1B1713]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.retailPrice}
                    onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs text-[#1B1713]"
                  />
                </div>
              </div>

              {/* Transit Cold Chain telemetry */}
              <div className="rounded-xl border border-[#CCE0C7] bg-[#EBF3EA]/60 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#4F7A38]">
                    <ShieldCheck size={16} />
                    <span>Reefer Vehicle Temperature Telemetry</span>
                  </div>
                  <span className="font-mono font-bold text-[#1B1713]">{formData.transitTempC}°C</span>
                </div>
                <p className="text-[11px] text-[#556942]">
                  Temperature is within recommended dairy threshold (2.0°C to 6.0°C).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Receiving Bay Remarks
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full rounded-xl border border-[#D5C6B5] p-2 text-xs text-[#1B1713]"
                />
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#EADDD0] bg-[#FAF7F2] p-4">
            <div className="text-xs text-[#7E7469]">
              <p className="font-semibold text-[#1B1713]">
                Target Ledger Node: peer0.org1.greenmart.internal:7051
              </p>
              <p>Cryptographic receipt endorsement will be signed with RetailerMSP credentials.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#3E2B22] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2A1D17] transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting to Fabric Network...</span>
                </>
              ) : (
                <>
                  <PackagePlus size={16} />
                  <span>Confirm Custody Transfer &amp; Receive Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
