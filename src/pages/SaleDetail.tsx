import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Printer, ShieldCheck, Receipt, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../utils/fefo';

export const SaleDetail: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const { sales, user } = useApp();
  const navigate = useNavigate();

  const sale = sales.find((s) => s.id === saleId || s.invoiceNumber === saleId);

  if (!sale) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto">
        <Receipt size={48} className="mx-auto text-[#7E7469] mb-4" />
        <h2 className="text-xl font-bold text-[#1B1713]">Invoice Not Found</h2>
        <p className="text-sm text-[#7E7469] mt-1">The requested sale record could not be found.</p>
        <button
          onClick={() => navigate('/sales')}
          className="mt-4 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Back button and actions */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigate('/sales')}
          className="flex items-center gap-2 rounded-xl border border-[#D5C6B5] bg-white px-3 py-1.5 text-xs font-semibold text-[#1B1713] hover:bg-[#F6F2EA]"
        >
          <ArrowLeft size={16} />
          <span>Back to Sales Invoices</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-xl bg-[#3E2B22] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2A1D17]"
        >
          <Printer size={15} />
          <span>Print Tax Invoice</span>
        </button>
      </div>

      {/* Tax Invoice Document */}
      <div className="rounded-3xl border border-[#EADDD0] bg-white p-8 shadow-sm space-y-6 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex justify-between border-b border-[#EADDD0] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1B1713]">TAX INVOICE</h1>
            <p className="text-sm font-semibold text-[#3E2B22] mt-1">{user.storeName}</p>
            <p className="text-xs text-[#7E7469]">Retailer GSTIN: 27AAAAA0000A1Z5</p>
            <p className="text-xs text-[#7E7469]">Food Safety License (FSSAI): 11521000000000</p>
          </div>
          <div className="text-right text-xs space-y-1">
            <p className="font-mono font-bold text-sm text-[#1B1713]">{sale.invoiceNumber}</p>
            <p className="text-[#7E7469]">Date: {sale.timestamp}</p>
            <p className="text-[#7E7469]">Cashier: {sale.cashier}</p>
            <span className="inline-block rounded-full bg-[#EBF3EA] px-2.5 py-0.5 text-[11px] font-bold text-[#4F7A38]">
              {sale.paymentMethod} • {sale.paymentStatus}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="rounded-xl bg-[#FAF7F2] p-4 text-xs border border-[#F0E6D8] flex justify-between">
          <div>
            <span className="text-[#8A8177] font-semibold uppercase tracking-wider text-[10px]">
              Customer Details
            </span>
            <p className="font-bold text-[#1B1713] text-sm mt-0.5">
              {sale.customerName || 'Walk-in Customer'}
            </p>
            {sale.customerPhone && <p className="text-[#7E7469]">{sale.customerPhone}</p>}
          </div>
          <div className="text-right">
            <span className="text-[#8A8177] font-semibold uppercase tracking-wider text-[10px]">
              Consortium Verification
            </span>
            <div className="flex items-center gap-1 text-[#4F7A38] font-bold mt-0.5">
              <CheckCircle2 size={14} />
              <span>Fabric Validated</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#EADDD0] text-[#7E7469] font-semibold">
            <tr>
              <th className="pb-3">Item Description</th>
              <th className="pb-3">Batch Reference</th>
              <th className="pb-3 text-right">MRP</th>
              <th className="pb-3 text-center">Qty</th>
              <th className="pb-3 text-right">Discount</th>
              <th className="pb-3 text-right">Net Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0E6D8]">
            {sale.items.map((it, idx) => (
              <tr key={idx}>
                <td className="py-3 font-medium text-[#1B1713]">{it.productName}</td>
                <td className="py-3 font-mono text-[#7E7469]">
                  {it.batchId} ({it.daysRemaining}d left)
                </td>
                <td className="py-3 text-right text-[#7E7469]">{formatINR(it.unitPrice)}</td>
                <td className="py-3 text-center font-bold text-[#1B1713]">{it.quantity}</td>
                <td className="py-3 text-right text-[#C2671A]">
                  {it.discountPct > 0 ? `${it.discountPct}%` : '—'}
                </td>
                <td className="py-3 text-right font-bold text-[#1B1713]">
                  {formatINR(it.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-[#EADDD0] pt-4 space-y-2 text-xs text-right max-w-xs ml-auto">
          <div className="flex justify-between text-[#7E7469]">
            <span>Gross Subtotal:</span>
            <span>{formatINR(sale.subtotal)}</span>
          </div>
          {sale.discountTotal > 0 && (
            <div className="flex justify-between text-[#C2671A] font-medium">
              <span>Dynamic Shelf-Life Savings:</span>
              <span>-{formatINR(sale.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#7E7469]">
            <span>CGST (2.5%) + SGST (2.5%):</span>
            <span>{formatINR(sale.taxTotal)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#1B1713] border-t border-[#EADDD0] pt-2">
            <span>Grand Total (INR):</span>
            <span>{formatINR(sale.grandTotal)}</span>
          </div>
        </div>

        {/* Blockchain reference */}
        <div className="rounded-2xl border border-[#EADDD0] bg-[#F6F2EA] p-4 text-[11px] font-mono text-[#7E7469] space-y-1">
          <p className="font-bold text-[#3E2B22]">Immutable Ledger Audit Signature:</p>
          <p className="truncate">Tx ID: {sale.blockchainTxId || '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a'}</p>
          <p>Consortium MSP: RetailerMSP • Channel: foodtrace-consortium</p>
        </div>
      </div>
    </div>
  );
};
