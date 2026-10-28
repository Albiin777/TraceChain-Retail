import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import {
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Printer,
  Sparkles,
  Search,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

export const QRModal: React.FC = () => {
  const { isQRScannerOpen, closeQRScanner, batches, products, qrScanCallback } = useApp();
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('scan');
  const [manualCode, setManualCode] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>('TCM00123');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [scanSuccessBatch, setScanSuccessBatch] = useState<any | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Find currently selected or scanned batch
  const activeBatch = batches.find(
    (b) => b.batchId.toLowerCase() === (selectedBatchId || '').toLowerCase()
  );

  // Generate QR code data URL whenever activeBatch changes
  useEffect(() => {
    if (activeBatch) {
      const qrPayload = JSON.stringify({
        batchId: activeBatch.batchId,
        productId: activeBatch.productId,
        productName: activeBatch.productName,
        expiryDate: activeBatch.expiryDate,
        ledgerTx: activeBatch.txId,
        verifyUrl: `https://tracechain.app/verify/${activeBatch.batchId}`,
      });

      QRCode.toDataURL(qrPayload, {
        width: 260,
        margin: 2,
        color: {
          dark: '#1B1713',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [activeBatch]);

  // Handle Quick Select / Scan
  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    const b = batches.find((x) => x.batchId.toLowerCase() === batchId.toLowerCase());
    if (b) {
      setScanSuccessBatch(b);
      if (qrScanCallback) {
        qrScanCallback(b.batchId);
      }
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleSelectBatch(manualCode.trim());
    }
  };

  const handleStartCamera = async () => {
    try {
      setCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Camera access simulated or restricted in preview:', err);
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const handleClose = () => {
    handleStopCamera();
    closeQRScanner();
  };

  if (!isQRScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#EADDD0] bg-[#F6F2EA] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EADDD0] bg-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3E2B22] text-white">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1B1713]">
                TraceChain QR Hub
              </h2>
              <p className="text-xs text-[#7E7469]">
                Scan physical batch labels or generate verifiable QR tags
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-[#7E7469] hover:bg-[#F6F2EA] hover:text-[#1B1713]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#EADDD0] bg-[#ECE5DA]/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('scan')}
            className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'scan'
                ? 'border-[#6B734A] text-[#1B1713]'
                : 'border-transparent text-[#7E7469] hover:text-[#1B1713]'
            }`}
          >
            1. Scan Batch QR
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'generate'
                ? 'border-[#6B734A] text-[#1B1713]'
                : 'border-transparent text-[#7E7469] hover:text-[#1B1713]'
            }`}
          >
            2. Generate &amp; Print Label
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'scan' ? (
            <div className="space-y-6">
              {/* Camera Scanner Viewfinder */}
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#D2C5B4] bg-[#221C17] p-6 text-white min-h-[220px]">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    className="h-48 w-full rounded-xl object-cover"
                    playsInline
                    muted
                  />
                ) : (
                  <div className="text-center py-4">
                    <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                      <Camera size={28} className="text-[#A7B27C]" />
                      <div className="absolute inset-0 rounded-2xl border border-dashed border-[#A7B27C] animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-[#F6F2EA]">
                      Point device camera at any TraceChain batch QR code
                    </p>
                    <p className="mt-1 text-xs text-[#A39E98]">
                      Or choose a test batch below for instant interactive lookup
                    </p>
                    <button
                      onClick={handleStartCamera}
                      className="mt-4 rounded-xl bg-[#6B734A] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#585F3B] transition-colors"
                    >
                      Activate Camera Lens
                    </button>
                  </div>
                )}
              </div>

              {/* Quick interactive test chips */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7E7469]">
                  Instant Test Batches (Click to verify):
                </p>
                <div className="flex flex-wrap gap-2">
                  {batches.slice(0, 5).map((b) => (
                    <button
                      key={b.batchId}
                      onClick={() => handleSelectBatch(b.batchId)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                        selectedBatchId === b.batchId
                          ? 'border-[#6B734A] bg-[#6B734A] text-white shadow-xs'
                          : 'border-[#D5C6B5] bg-white text-[#1B1713] hover:bg-[#ECE5DA]'
                      }`}
                    >
                      <Layers size={13} />
                      <span>{b.batchId}</span>
                      <span className="opacity-75">({b.productName.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Entry */}
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-[#7E7469]" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Or enter batch identifier (e.g. TCM00123)..."
                    className="w-full rounded-xl border border-[#D5C6B5] bg-white py-2 pl-9 pr-3 text-xs text-[#1B1713] focus:border-[#6B734A] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-medium text-white hover:bg-[#2A1D17]"
                >
                  Lookup
                </button>
              </form>

              {/* Scanned Result Card */}
              {activeBatch && (
                <div className="rounded-2xl border border-[#D5C6B5] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between border-b border-[#F0E6D8] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#1B1713]">
                          {activeBatch.productName}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            activeBatch.status === 'expired'
                              ? 'bg-red-100 text-red-700'
                              : activeBatch.status === 'near_expiry'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {activeBatch.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#7E7469]">
                        Batch #{activeBatch.batchId} • Supplier: {activeBatch.supplier}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-[#EBF3EA] px-2 py-1 text-xs font-semibold text-[#4F7A38]">
                      <CheckCircle2 size={14} />
                      <span>Ledger Verified</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 text-xs sm:grid-cols-4">
                    <div>
                      <span className="text-[#8A8177]">Expiry Date</span>
                      <p className="font-semibold text-[#1B1713]">{activeBatch.expiryDate}</p>
                    </div>
                    <div>
                      <span className="text-[#8A8177]">Days Remaining</span>
                      <p
                        className={`font-semibold ${
                          activeBatch.daysRemaining <= 3 ? 'text-red-600' : 'text-[#1B1713]'
                        }`}
                      >
                        {activeBatch.daysRemaining} days left
                      </p>
                    </div>
                    <div>
                      <span className="text-[#8A8177]">Available Stock</span>
                      <p className="font-semibold text-[#1B1713]">
                        {activeBatch.availableQuantity} units
                      </p>
                    </div>
                    <div>
                      <span className="text-[#8A8177]">Retail Price</span>
                      <p className="font-semibold text-[#1B1713]">
                        {formatINR(activeBatch.retailPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F0E6D8]">
                    <button
                      onClick={() => {
                        handleClose();
                        navigate(`/batches/${activeBatch.batchId}`);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-[#3E2B22] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2A1D17]"
                    >
                      <span>View Batch Details</span>
                      <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate(`/product-history/${activeBatch.productId}`);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-[#D5C6B5] bg-[#F6F2EA] px-3.5 py-1.5 text-xs font-medium text-[#1B1713] hover:bg-[#EADDD0]"
                    >
                      <span>Supply Chain Timeline</span>
                    </button>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate(`/sales/new?batchId=${activeBatch.batchId}`);
                      }}
                      disabled={activeBatch.status === 'expired' || activeBatch.availableQuantity <= 0}
                      className="flex items-center gap-1.5 rounded-xl border border-[#6B734A] bg-[#6B734A]/10 px-3.5 py-1.5 text-xs font-semibold text-[#6B734A] hover:bg-[#6B734A]/20 disabled:opacity-40"
                    >
                      <span>Bill in POS</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Generate QR Tab */
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-full max-w-sm rounded-2xl border border-[#D5C6B5] bg-white p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                    Verifiable Retail Tag
                  </span>
                  <span className="rounded bg-[#EBF3EA] px-2 py-0.5 text-[10px] font-bold text-[#4F7A38]">
                    Fabric v2.4
                  </span>
                </div>

                {qrDataUrl ? (
                  <div className="mx-auto flex justify-center p-3 bg-white border border-[#EADDD0] rounded-xl shadow-xs">
                    <img src={qrDataUrl} alt="Batch QR Code" className="h-44 w-44" />
                  </div>
                ) : (
                  <div className="h-44 w-44 bg-gray-100 flex items-center justify-center mx-auto rounded-xl">
                    Generating...
                  </div>
                )}

                <div className="mt-4 text-left">
                  <p className="text-sm font-bold text-[#1B1713]">{activeBatch?.productName}</p>
                  <p className="text-xs text-[#7E7469]">Batch ID: {activeBatch?.batchId}</p>
                  <p className="text-xs text-[#7E7469]">Exp: {activeBatch?.expiryDate}</p>
                  <p className="mt-1 truncate font-mono text-[10px] text-[#8A8177]">
                    Tx: {activeBatch?.txId}
                  </p>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3E2B22] py-2 text-xs font-semibold text-white hover:bg-[#2A1D17]"
                  >
                    <Printer size={14} />
                    <span>Print Label</span>
                  </button>
                  <a
                    href={qrDataUrl}
                    download={`TraceChain-${activeBatch?.batchId}.png`}
                    className="flex items-center justify-center rounded-xl border border-[#D5C6B5] bg-[#F6F2EA] px-3 py-2 text-xs font-semibold text-[#1B1713] hover:bg-[#EADDD0]"
                  >
                    Download PNG
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
