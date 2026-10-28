import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  ShieldCheck,
  Thermometer,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Plus,
  X,
  FileCheck,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

export const BatchDetail: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const { batches, products, lifecycleEvents, storageLogs, logTemperature, recordWastageOrDisposal } = useApp();
  const navigate = useNavigate();

  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);

  // Form states
  const [tempC, setTempC] = useState<number>(3.5);
  const [tempNotes, setTempNotes] = useState('');
  const [wasteQty, setWasteQty] = useState<number>(1);
  const [wasteReason, setWasteReason] = useState('Expired Shelf-Life Removal');

  const batch = batches.find((b) => b.batchId.toLowerCase() === (batchId || '').toLowerCase());
  const product = batch ? products.find((p) => p.id === batch.productId) : null;

  if (!batch) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto">
        <Layers size={48} className="mx-auto text-[#7E7469] mb-4" />
        <h2 className="text-xl font-bold text-[#1B1713]">Batch Not Found</h2>
        <p className="text-sm text-[#7E7469] mt-1">
          Batch #{batchId} could not be found on the retailer ledger index.
        </p>
        <button
          onClick={() => navigate('/batches')}
          className="mt-4 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Batches
        </button>
      </div>
    );
  }

  // Filter logs & events for this batch
  const batchLogs = storageLogs.filter((l) => l.batchId === batch.batchId);
  const batchEvents = lifecycleEvents.filter((e) => e.batchId === batch.batchId);

  const handleLogTempSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logTemperature({
      batchId: batch.batchId,
      productId: batch.productId,
      temperatureC: Number(tempC),
      notes: tempNotes,
      source: 'MANUAL_ENTRY',
    });
    setIsTempModalOpen(false);
    setTempNotes('');
  };

  const handleWastageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wasteQty <= 0) return;
    await recordWastageOrDisposal({
      batchId: batch.batchId,
      quantity: Number(wasteQty),
      reason: wasteReason,
    });
    setIsWasteModalOpen(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/batches')}
            className="rounded-xl border border-[#D5C6B5] bg-white p-2 text-[#3E2B22] hover:bg-[#F6F2EA] transition"
            aria-label="Back to batches"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">
                Batch #{batch.batchId}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  batch.status === 'expired'
                    ? 'bg-red-100 text-red-700'
                    : batch.status === 'near_expiry'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {batch.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[#7E7469] mt-0.5">
              {batch.productName} • Supplier: {batch.supplier}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTempModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#D5C6B5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1B1713] hover:bg-[#F6F2EA] transition"
          >
            <Thermometer size={15} className="text-[#6B734A]" />
            <span>Log Chiller Temp</span>
          </button>

          <button
            onClick={() => setIsWasteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
          >
            <Trash2 size={15} />
            <span>Record Disposal</span>
          </button>

          <button
            onClick={() => navigate(`/product-history/${batch.productId}?batchId=${batch.batchId}`)}
            className="flex items-center gap-1.5 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2A1D17] transition"
          >
            <span>Supply Chain Provenance</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Batch Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Available Inventory</span>
          <p className="text-2xl font-bold text-[#1B1713] mt-1">{batch.availableQuantity}</p>
          <p className="text-[11px] text-[#7E7469] mt-1">
            Received: {batch.quantityReceived} | Sold: {batch.quantitySold}
          </p>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Days to Expiry</span>
          <p
            className={`text-2xl font-bold mt-1 ${
              batch.daysRemaining <= 0 ? 'text-red-600' : 'text-[#1B1713]'
            }`}
          >
            {batch.daysRemaining} days
          </p>
          <p className="text-[11px] text-[#7E7469] mt-1">Expiry Date: {batch.expiryDate}</p>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Current Custodian</span>
          <p className="text-sm font-bold text-[#1B1713] mt-1 truncate">{batch.currentCustodian}</p>
          <p className="text-[11px] text-[#4F7A38] mt-1">Authorized Holder</p>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Consortium Ledger Anchor</span>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-[#4F7A38]">
            <CheckCircle2 size={16} />
            <span>COMMITTED (Block #{batch.blockNumber})</span>
          </div>
          <p className="text-[10px] text-[#7E7469] font-mono truncate mt-1">{batch.txId}</p>
        </div>
      </div>

      {/* Temperature Logs Section */}
      <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
          <div className="flex items-center gap-2">
            <Thermometer size={18} className="text-[#6B734A]" />
            <h2 className="text-base font-bold text-[#1B1713]">
              Cold Chain Storage History ({batchLogs.length} readings)
            </h2>
          </div>
          <button
            onClick={() => setIsTempModalOpen(true)}
            className="text-xs font-semibold text-[#3E2B22] hover:text-[#6B734A]"
          >
            + Add Measurement
          </button>
        </div>

        {batchLogs.length === 0 ? (
          <p className="text-xs text-[#7E7469] py-4 text-center">
            No temperature logs recorded yet for this batch.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#EADDD0] text-[#7E7469] font-semibold">
                <tr>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Temperature (°C)</th>
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Logged By</th>
                  <th className="pb-2">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6D8]">
                {batchLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 font-medium text-[#1B1713]">{log.timestamp}</td>
                    <td className="py-2.5 font-bold text-sm text-[#1B1713]">
                      {log.temperatureC}°C
                    </td>
                    <td className="py-2.5 text-[#7E7469]">
                      <span className="rounded bg-[#F6F2EA] px-2 py-0.5 text-[10px] font-semibold">
                        {log.source === 'IOT_SENSOR' ? 'IoT Sensor Telemetry' : 'Manual Probe'}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#7E7469]">{log.loggedBy}</td>
                    <td className="py-2.5">
                      {log.isWithinLimits ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4F7A38]">
                          <CheckCircle2 size={13} />
                          <span>Within 2°C - 6°C Range</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                          <AlertTriangle size={13} />
                          <span>Limit Breach</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Log Temperature */}
      {isTempModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#EADDD0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
              <h2 className="text-base font-bold text-[#1B1713]">Record Storage Temperature</h2>
              <button
                onClick={() => setIsTempModalOpen(false)}
                className="rounded-full p-1 text-[#8A8177] hover:bg-[#F6F2EA]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogTempSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Chiller Temperature (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={tempC}
                  onChange={(e) => setTempC(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-sm font-bold text-[#1B1713]"
                />
                <p className="mt-1 text-[11px] text-[#7E7469]">
                  Standard safe threshold: 2.0°C to 6.0°C
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Observation Notes
                </label>
                <textarea
                  rows={2}
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="e.g. Verified with digital calibrated probe during morning check."
                  className="w-full rounded-xl border border-[#D5C6B5] p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F0E6D8]">
                <button
                  type="button"
                  onClick={() => setIsTempModalOpen(false)}
                  className="rounded-xl border border-[#D5C6B5] px-4 py-2 text-xs font-semibold text-[#1B1713]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#3E2B22] px-5 py-2 text-xs font-semibold text-white"
                >
                  Commit to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Wastage / Disposal */}
      {isWasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#EADDD0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
              <h2 className="text-base font-bold text-red-700">Record Stock Disposal / Wastage</h2>
              <button
                onClick={() => setIsWasteModalOpen(false)}
                className="rounded-full p-1 text-[#8A8177] hover:bg-[#F6F2EA]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWastageSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Quantity to Dispose (Max: {batch.availableQuantity} units) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={batch.availableQuantity}
                  required
                  value={wasteQty}
                  onChange={(e) => setWasteQty(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-sm font-bold text-[#1B1713]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                  Reason for Disposal *
                </label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs"
                >
                  <option value="Expired Shelf-Life Removal">Expired Shelf-Life Removal</option>
                  <option value="Packaging Leak / Damage">Packaging Leak / Damage</option>
                  <option value="Cold Chain Temperature Abuse">Cold Chain Temperature Abuse</option>
                  <option value="Donation to Food Bank">Donation to Food Bank</option>
                  <option value="Composting / Bio-recycling">Composting / Bio-recycling</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F0E6D8]">
                <button
                  type="button"
                  onClick={() => setIsWasteModalOpen(false)}
                  className="rounded-xl border border-[#D5C6B5] px-4 py-2 text-xs font-semibold text-[#1B1713]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-700 px-5 py-2 text-xs font-semibold text-white hover:bg-red-800"
                >
                  Confirm Disposal on Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
