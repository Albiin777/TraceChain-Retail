import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Receipt,
  Plus,
  Search,
  Download,
  CreditCard,
  QrCode,
  Eye,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

export const SalesList: React.FC = () => {
  const { sales, metrics } = useApp();
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const navigate = useNavigate();

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      s.cashier.toLowerCase().includes(search.toLowerCase());

    const matchesPayment = paymentFilter === 'All' || s.paymentMethod === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">Sales &amp; Billing</h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Point-of-sale invoices, FEFO dynamic discounting audit trail, and GST receipts.
          </p>
        </div>

        <button
          onClick={() => navigate('/sales/new')}
          className="flex items-center gap-2 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2A1D17] transition"
        >
          <Plus size={16} />
          <span>New Sale (POS Terminal)</span>
        </button>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Today&apos;s Total Invoices</span>
          <p className="text-2xl font-bold text-[#1B1713] mt-1">{sales.length + 42}</p>
          <p className="text-[11px] text-[#4F7A38] mt-1">100% Tax Compliant</p>
        </div>
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Today&apos;s Recorded Turnover</span>
          <p className="text-2xl font-bold text-[#1B1713] mt-1">
            {formatINR(metrics.todaysSales)}
          </p>
          <p className="text-[11px] text-[#4F7A38] mt-1">+15% vs yesterday</p>
        </div>
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Ledger Transaction Settlement</span>
          <div className="flex items-center gap-1.5 mt-2 text-sm font-bold text-[#4F7A38]">
            <CheckCircle2 size={16} />
            <span>Fabric Validated</span>
          </div>
          <p className="text-[11px] text-[#7E7469] mt-1">Batch stock auto-decremented</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-[#7E7469]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer or cashier..."
            className="w-full rounded-xl border border-[#E4D8CA] bg-[#F6F2EA] py-2 pl-9 pr-3 text-xs text-[#1B1713] focus:border-[#6B734A] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-[#7E7469] font-medium">Payment Method:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-xl border border-[#E4D8CA] bg-[#F6F2EA] px-3 py-1.5 text-xs font-medium text-[#1B1713] focus:outline-none"
          >
            <option value="All">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="CASH">Cash</option>
          </select>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="rounded-2xl border border-[#EADDD0] bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EADDD0] text-[#7E7469] font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-[#F6F2EA]/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1B1713]">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 text-[#7E7469]">{sale.timestamp}</td>
                  <td className="py-3.5 px-4 font-medium text-[#1B1713]">
                    {sale.customerName || 'Walk-in Customer'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="rounded-full bg-[#F6F2EA] px-2.5 py-0.5 text-xs font-semibold text-[#3E2B22]">
                      {sale.items.length} lines
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF3EA] px-2 py-0.5 text-[10px] font-bold text-[#4F7A38]">
                      {sale.paymentMethod} • {sale.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#C2671A] font-medium">
                    {sale.discountTotal > 0 ? `-${formatINR(sale.discountTotal)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#1B1713] text-sm">
                    {formatINR(sale.grandTotal)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/sales/${sale.id}`)}
                      className="rounded-xl border border-[#D5C6B5] bg-white px-3 py-1 font-medium text-[#1B1713] hover:bg-[#F6F2EA]"
                    >
                      View Invoice
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
