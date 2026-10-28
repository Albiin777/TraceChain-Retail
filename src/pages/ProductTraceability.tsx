import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  QrCode,
  Building2,
  UserCheck,
  MapPin,
  FileCheck,
  X,
  Layers,
} from 'lucide-react';
import { fabricGateway } from '../services/fabricService';
import { LifecycleEvent } from '../types';

export const ProductTraceability: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const { products, batches, lifecycleEvents, openQRScanner } = useApp();
  const navigate = useNavigate();

  const filterBatchId = searchParams.get('batchId');
  const [selectedTxModal, setSelectedTxModal] = useState<any | null>(null);

  // Find product or default to first product
  const product = products.find((p) => p.id === productId) || products[0];

  // Filter events for this product (and optionally specific batch)
  const events = lifecycleEvents
    .filter((e) => e.productId === product.id && (!filterBatchId || e.batchId === filterBatchId))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Distinct batches available for this product
  const productBatches = batches.filter((b) => b.productId === product.id);

  const handleVerifyTx = async (txId: string) => {
    const result = await fabricGateway.verifyTransaction(txId);
    setSelectedTxModal(result);
  };

  const getStageBadge = (type: LifecycleEvent['eventType']) => {
    switch (type) {
      case 'PRODUCT_REGISTRATION':
        return { label: '1. Registration', color: 'bg-stone-100 text-stone-800' };
      case 'MANUFACTURING':
        return { label: '2. Processing & HTST', color: 'bg-blue-100 text-blue-800' };
      case 'PACKAGING':
        return { label: '3. Aseptic Packaging', color: 'bg-purple-100 text-purple-800' };
      case 'QUALITY_INSPECTION':
        return { label: '4. Lab Quality & FSSAI', color: 'bg-emerald-100 text-emerald-800' };
      case 'DISPATCH_FROM_SUPPLIER':
        return { label: '5. Supplier Dispatch', color: 'bg-amber-100 text-amber-800' };
      case 'TRANSIT_CUSTODY_TRANSFER':
        return { label: '6. Cold Logistics Transit', color: 'bg-indigo-100 text-indigo-800' };
      case 'RETAILER_RECEIPT':
        return { label: '7. Retailer Receipt', color: 'bg-[#EBF3EA] text-[#4F7A38]' };
      case 'STORAGE_CONDITION_LOG':
        return { label: '8. Chiller Telemetry', color: 'bg-teal-100 text-teal-800' };
      case 'RETAIL_SALE':
        return { label: '9. Consumer Sale', color: 'bg-stone-200 text-stone-900' };
      case 'WASTAGE_OR_DISPOSAL':
        return { label: '10. Safe Disposal', color: 'bg-red-100 text-red-800' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inventory')}
            className="rounded-xl border border-[#D5C6B5] bg-white p-2 text-[#3E2B22] hover:bg-[#F6F2EA] transition"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">
                Supply-Chain Provenance
              </h1>
              <span className="rounded-full bg-[#EBF3EA] px-2.5 py-0.5 text-xs font-bold text-[#4F7A38]">
                Hyperledger Fabric Ledger
              </span>
            </div>
            <p className="text-xs text-[#7E7469] mt-0.5">
              {product.name} ({product.sku}) • Farm to Shelf Traceability
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            openQRScanner((batchId) => {
              const b = batches.find((x) => x.batchId.toLowerCase() === batchId.toLowerCase());
              if (b) navigate(`/product-history/${b.productId}?batchId=${b.batchId}`);
            })
          }
          className="flex items-center gap-2 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2A1D17]"
        >
          <QrCode size={16} />
          <span>Scan Any Batch QR</span>
        </button>
      </div>

      {/* Batch Filter selector if multiple batches exist */}
      {productBatches.length > 0 && (
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#7E7469] mr-2">Filter by Lot / Batch:</span>
          <button
            onClick={() => navigate(`/product-history/${product.id}`)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              !filterBatchId
                ? 'bg-[#3E2B22] text-white shadow-xs'
                : 'border border-[#D5C6B5] bg-white text-[#1B1713] hover:bg-[#F6F2EA]'
            }`}
          >
            All Batches
          </button>
          {productBatches.map((b) => (
            <button
              key={b.batchId}
              onClick={() => navigate(`/product-history/${product.id}?batchId=${b.batchId}`)}
              className={`rounded-xl px-3 py-1.5 text-xs font-mono font-medium transition ${
                filterBatchId === b.batchId
                  ? 'bg-[#6B734A] text-white shadow-xs'
                  : 'border border-[#D5C6B5] bg-white text-[#1B1713] hover:bg-[#F6F2EA]'
              }`}
            >
              #{b.batchId}
            </button>
          ))}
        </div>
      )}

      {/* Chronological Timeline */}
      <div className="rounded-3xl border border-[#EADDD0] bg-white p-6 md:p-8 shadow-2xs space-y-8">
        <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#6B734A]" />
            <h2 className="text-base font-bold text-[#1B1713]">
              Chronological Audit Ledger ({events.length} immutable events)
            </h2>
          </div>
          <span className="text-xs text-[#7E7469]">Consortium Peer Consensus Verified</span>
        </div>

        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7E7469]">
            No verified ledger events found for this filter criteria.
          </div>
        ) : (
          <div className="relative pl-6 md:pl-8 border-l-2 border-[#EADDD0] space-y-8 ml-3">
            {events.map((evt, idx) => {
              const badge = getStageBadge(evt.eventType);

              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline bullet node */}
                  <div className="absolute -left-[31px] md:-left-[39px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#6B734A] text-white ring-4 ring-white shadow-xs">
                    <CheckCircle2 size={14} />
                  </div>

                  <div className="rounded-2xl border border-[#EADDD0] bg-[#FAF7F2] p-5 hover:border-[#6B734A] transition shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#1B1713]">
                          Batch #{evt.batchId}
                        </span>
                      </div>
                      <span className="text-xs text-[#7E7469] flex items-center gap-1">
                        <Clock size={13} />
                        <span>{evt.timestamp}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#1B1713] leading-relaxed font-medium">
                      {evt.details}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#7E7469] pt-2 border-t border-[#EADDD0]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 size={13} className="text-[#3E2B22] shrink-0" />
                        <span className="truncate">{evt.organization}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <UserCheck size={13} className="text-[#3E2B22] shrink-0" />
                        <span className="truncate">{evt.actor}</span>
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-1.5 truncate col-span-2">
                          <MapPin size={13} className="text-[#6B734A] shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Ledger verification signature */}
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#D5C6B5] text-[11px] font-mono text-[#7E7469]">
                      <span className="truncate max-w-[280px]">Tx: {evt.blockchainTxId}</span>
                      <button
                        onClick={() => handleVerifyTx(evt.blockchainTxId)}
                        className="flex items-center gap-1 text-[#4F7A38] font-bold hover:underline shrink-0"
                      >
                        <FileCheck size={13} />
                        <span>Verify Proof</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Proof Verification Modal */}
      {selectedTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-[#CCE0C7] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
              <div className="flex items-center gap-2 text-[#4F7A38]">
                <ShieldCheck size={20} />
                <h2 className="text-base font-bold text-[#1B1713]">
                  Cryptographic Ledger Proof
                </h2>
              </div>
              <button
                onClick={() => setSelectedTxModal(null)}
                className="rounded-full p-1 text-[#8A8177] hover:bg-[#F6F2EA]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-[#EBF3EA] p-4 text-xs font-mono space-y-2 border border-[#CCE0C7]">
              <div className="flex justify-between">
                <span className="text-[#556942]">Commit Status:</span>
                <span className="font-bold text-[#4F7A38]">VALID &amp; COMMITTED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#556942]">Channel ID:</span>
                <span className="text-[#1B1713]">foodtrace-consortium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#556942]">Block Height:</span>
                <span className="font-bold text-[#1B1713]">#{selectedTxModal.blockNumber}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#556942]">Transaction ID:</span>
                <span className="text-[11px] text-[#1B1713] break-all">{selectedTxModal.txId}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#556942]">Payload SHA-256 Digest:</span>
                <span className="text-[11px] text-[#1B1713] break-all">{selectedTxModal.payloadDigest}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#556942]">Endorsing Peer MSPs:</span>
                <ul className="list-disc pl-4 text-[11px] text-[#1B1713]">
                  {selectedTxModal.endorsingPeers.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTxModal(null)}
                className="rounded-xl bg-[#3E2B22] px-5 py-2 text-xs font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
