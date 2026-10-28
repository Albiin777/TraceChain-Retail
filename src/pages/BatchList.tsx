import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

export const BatchList: React.FC = () => {
  const { batches, openQRScanner } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialStatus = searchParams.get('status') || 'All';
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [search, setSearch] = useState('');

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchId.toLowerCase().includes(search.toLowerCase()) ||
      b.productName.toLowerCase().includes(search.toLowerCase()) ||
      b.supplier.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : b.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: batches.length,
    near_expiry: batches.filter((b) => b.status === 'near_expiry').length,
    expired: batches.filter((b) => b.status === 'expired').length,
    low_stock: batches.filter((b) => b.status === 'low_stock').length,
    normal: batches.filter((b) => b.status === 'normal').length,
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">Batch Tracking</h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Monitor lot lifecycles, shelf-life countdowns, and Hyperledger Fabric custody records.
          </p>
        </div>

        <button
          onClick={() => openQRScanner()}
          className="flex items-center gap-2 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2A1D17] transition"
        >
          <QrCode size={16} />
          <span>Lookup Batch by QR</span>
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('All')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'All'
              ? 'bg-[#3E2B22] text-white shadow-xs'
              : 'border border-[#D5C6B5] bg-white text-[#1B1713] hover:bg-[#F6F2EA]'
          }`}
        >
          All Batches ({counts.all})
        </button>
        <button
          onClick={() => setStatusFilter('near_expiry')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'near_expiry'
              ? 'bg-[#FFF3E8] border border-[#FFD9B3] text-[#C2671A] font-bold shadow-xs'
              : 'border border-[#D5C6B5] bg-white text-[#C2671A] hover:bg-[#FFF3E8]'
          }`}
        >
          Near Expiry ({counts.near_expiry})
        </button>
        <button
          onClick={() => setStatusFilter('expired')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'expired'
              ? 'bg-[#FDE8E8] border border-[#F8B4B4] text-[#D32F2F] font-bold shadow-xs'
              : 'border border-[#D5C6B5] bg-white text-[#D32F2F] hover:bg-[#FDE8E8]'
          }`}
        >
          Expired Stock ({counts.expired})
        </button>
        <button
          onClick={() => setStatusFilter('low_stock')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'low_stock'
              ? 'bg-[#EBF3EA] border border-[#CCE0C7] text-[#4F7A38] font-bold shadow-xs'
              : 'border border-[#D5C6B5] bg-white text-[#4F7A38] hover:bg-[#EBF3EA]'
          }`}
        >
          Low Stock ({counts.low_stock})
        </button>
        <button
          onClick={() => setStatusFilter('normal')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'normal'
              ? 'bg-[#4E5738] text-white shadow-xs'
              : 'border border-[#D5C6B5] bg-white text-[#4E5738] hover:bg-[#F6F2EA]'
          }`}
        >
          Normal Stock ({counts.normal})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-3 text-[#7E7469]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter batches by Batch ID, Product or Supplier..."
          className="w-full rounded-xl border border-[#E4D8CA] bg-white py-2 pl-9 pr-3 text-xs text-[#1B1713] focus:border-[#6B734A] focus:outline-none"
        />
      </div>

      {/* Batches Table */}
      <div className="rounded-2xl border border-[#EADDD0] bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EADDD0] text-[#7E7469] font-semibold">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-center">Days Left</th>
                <th className="py-3 px-4 text-center">Available Units</th>
                <th className="py-3 px-4">Current Custodian</th>
                <th className="py-3 px-4">Ledger Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {filteredBatches.map((b) => (
                <tr key={b.batchId} className="hover:bg-[#F6F2EA]/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1B1713]">{b.batchId}</td>
                  <td className="py-3.5 px-4 font-medium text-[#1B1713]">{b.productName}</td>
                  <td className="py-3.5 px-4 text-[#7E7469]">{b.supplier}</td>
                  <td className="py-3.5 px-4 text-[#1B1713] font-medium">{b.expiryDate}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${
                        b.daysRemaining <= 0
                          ? 'bg-[#FDE8E8] text-[#D32F2F]'
                          : b.daysRemaining <= 3
                          ? 'bg-[#FFEDE0] text-[#D32F2F]'
                          : b.daysRemaining <= 7
                          ? 'bg-[#FFEDE0] text-[#E65100]'
                          : 'bg-[#EBF3EA] text-[#4F7A38]'
                      }`}
                    >
                      {b.daysRemaining}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-sm text-[#1B1713]">
                    {b.availableQuantity}
                  </td>
                  <td className="py-3.5 px-4 text-[#7E7469]">{b.currentCustodian}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#4F7A38]">
                      <ShieldCheck size={14} />
                      <span>COMMITTED</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/batches/${b.batchId}`)}
                      className="rounded-xl border border-[#D5C6B5] bg-white px-3 py-1 font-medium text-[#1B1713] hover:bg-[#F6F2EA] transition"
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
