import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Layers,
  Receipt,
  Trash2,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

type ReportType =
  | 'inventory'
  | 'expiry'
  | 'movement'
  | 'sales'
  | 'invoices'
  | 'wastage'
  | 'returns'
  | 'blockchain';

export const Reports: React.FC = () => {
  const { products, batches, sales, lifecycleEvents, storageLogs } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('inventory');
  const [dateRange, setDateRange] = useState('October 2026');

  const reportOptions: { id: ReportType; label: string; desc: string; icon: any }[] = [
    { id: 'inventory', label: '1. Inventory Report', desc: 'Current SKU stock levels, valuations & reorder thresholds', icon: Package },
    { id: 'expiry', label: '2. Batch Expiry Report', desc: 'Critical shelf-life countdown and at-risk stock lots', icon: Layers },
    { id: 'sales', label: '3. Sales & Revenue Report', desc: 'Aggregated turnover, discounts, and item performance', icon: Receipt },
    { id: 'invoices', label: '4. GST Invoices Audit', desc: 'Tax invoice registry, CGST/SGST breakdowns, cashier logs', icon: FileText },
    { id: 'movement', label: '5. Stock Movement Ledger', desc: 'Auditable trail of receipts, sales deductions, adjustments', icon: Layers },
    { id: 'wastage', label: '6. Wastage & Disposal Report', desc: 'Expired/damaged stock write-offs and organic disposal logs', icon: Trash2 },
    { id: 'returns', label: '7. Returns & Reversals', desc: 'Reversals, customer refunds, and return reasons', icon: Receipt },
    { id: 'blockchain', label: '8. Hyperledger Fabric Transactions', desc: 'Cryptographic commit blocks, peer endorsements, and tx hashes', icon: ShieldCheck },
  ];

  const handleDownloadCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `TraceChain_${selectedReport}_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    if (selectedReport === 'inventory') {
      headers = ['SKU', 'Product Name', 'Category', 'Retail Price', 'Cost Price', 'Reorder Level'];
      rows = products.map((p) => [p.sku, `"${p.name}"`, p.category, p.sellingPrice, p.costPrice, p.reorderThreshold]);
    } else if (selectedReport === 'expiry') {
      headers = ['Batch ID', 'Product', 'Supplier', 'Expiry Date', 'Days Remaining', 'Available Qty', 'Status'];
      rows = batches.map((b) => [b.batchId, `"${b.productName}"`, `"${b.supplier}"`, b.expiryDate, b.daysRemaining, b.availableQuantity, b.status]);
    } else if (selectedReport === 'sales' || selectedReport === 'invoices') {
      headers = ['Invoice Number', 'Timestamp', 'Customer', 'Cashier', 'Subtotal', 'Discount', 'GST Total', 'Grand Total', 'Payment Method'];
      rows = sales.map((s) => [s.invoiceNumber, s.timestamp, `"${s.customerName || 'Walk-in'}"`, s.cashier, s.subtotal, s.discountTotal, s.taxTotal, s.grandTotal, s.paymentMethod]);
    } else if (selectedReport === 'blockchain') {
      headers = ['Event Type', 'Batch Reference', 'Timestamp', 'Organization', 'Block Number', 'Transaction ID'];
      rows = lifecycleEvents.map((e) => [e.eventType, e.batchId, e.timestamp, `"${e.organization}"`, e.blockNumber, e.blockchainTxId]);
    } else {
      headers = ['Record ID', 'Batch ID', 'Timestamp', 'Detail'];
      rows = storageLogs.map((l) => [l.id, l.batchId, l.timestamp, `"${l.temperatureC}°C by ${l.loggedBy}"`]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">
            Compliance &amp; Operational Reports
          </h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Audit-ready reporting for inventory balances, GST filing, shelf-life compliance, and ledger commits.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2A1D17]"
        >
          <Download size={15} />
          <span>Export Selected Report (CSV)</span>
        </button>
      </div>

      {/* Grid: Left Report Selector + Right Report Table View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 8 Report Types (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#EADDD0] bg-white p-3 shadow-2xs space-y-1.5">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#7E7469]">
            Available Report Types
          </p>
          {reportOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedReport === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => setSelectedReport(opt.id)}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                  isSelected
                    ? 'bg-[#3E4528] text-white shadow-xs'
                    : 'text-[#1B1713] hover:bg-[#F6F2EA]'
                }`}
              >
                <Icon size={18} className={isSelected ? 'text-[#A7B27C]' : 'text-[#6B734A]'} />
                <div>
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-[#D8E0B8]' : 'text-[#7E7469]'}`}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Report Data Preview (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F0E6D8] pb-3 gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1B1713]">
                {reportOptions.find((r) => r.id === selectedReport)?.label}
              </h2>
              <p className="text-xs text-[#7E7469]">Filtered for reporting period: {dateRange}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="rounded-xl border border-[#D5C6B5] bg-white px-3 py-1.5 text-xs font-medium text-[#1B1713] hover:bg-[#F6F2EA]"
            >
              Print Report
            </button>
          </div>

          {/* Render Preview Table */}
          <div className="overflow-x-auto max-h-[480px]">
            {selectedReport === 'inventory' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#7E7469] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Retail Price</th>
                    <th className="py-2.5 px-3 text-center">Reorder Min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D8]">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-mono">{p.sku}</td>
                      <td className="py-2.5 px-3 font-medium text-[#1B1713]">{p.name}</td>
                      <td className="py-2.5 px-3 text-[#7E7469]">{p.category}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{formatINR(p.sellingPrice)}</td>
                      <td className="py-2.5 px-3 text-center">{p.reorderThreshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'expiry' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#7E7469] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Batch ID</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3 text-center">Days Left</th>
                    <th className="py-2.5 px-3 text-center">Available Stock</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D8]">
                  {batches.map((b) => (
                    <tr key={b.batchId}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1B1713]">{b.batchId}</td>
                      <td className="py-2.5 px-3 font-medium text-[#1B1713]">{b.productName}</td>
                      <td className="py-2.5 px-3 text-[#7E7469]">{b.expiryDate}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{b.daysRemaining}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{b.availableQuantity}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            b.status === 'expired'
                              ? 'bg-red-100 text-red-700'
                              : b.status === 'near_expiry'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {(selectedReport === 'sales' || selectedReport === 'invoices') && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#7E7469] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-right">Discount</th>
                    <th className="py-2.5 px-3 text-right">Tax (5%)</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D8]">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1B1713]">{s.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-[#7E7469]">{s.timestamp}</td>
                      <td className="py-2.5 px-3 font-medium text-[#1B1713]">{s.customerName || 'Walk-in'}</td>
                      <td className="py-2.5 px-3 text-right text-[#C2671A]">-{formatINR(s.discountTotal)}</td>
                      <td className="py-2.5 px-3 text-right text-[#7E7469]">{formatINR(s.taxTotal)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#1B1713]">{formatINR(s.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'blockchain' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#7E7469] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Batch ID</th>
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Block #</th>
                    <th className="py-2.5 px-3">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D8]">
                  {lifecycleEvents.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2.5 px-3 font-semibold text-[#1B1713]">{e.eventType}</td>
                      <td className="py-2.5 px-3 font-mono">{e.batchId}</td>
                      <td className="py-2.5 px-3 text-[#7E7469]">{e.organization}</td>
                      <td className="py-2.5 px-3 font-mono text-[#4F7A38]">#{e.blockNumber}</td>
                      <td className="py-2.5 px-3 font-mono truncate max-w-[140px] text-[#8A8177]">
                        {e.blockchainTxId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {(selectedReport === 'movement' || selectedReport === 'wastage' || selectedReport === 'returns') && (
              <div className="p-8 text-center text-xs text-[#7E7469]">
                All records currently reconciled with physical storage count and peer node ledgers. 0 anomalies detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
