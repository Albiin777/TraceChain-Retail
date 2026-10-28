import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search,
  QrCode,
  ChevronDown,
  Menu,
  Package,
  Layers,
  Bell,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { products, batches, openQRScanner, notifications } = useApp();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search results
  const matchingProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchingBatches = query.trim()
    ? batches.filter(
        (b) =>
          b.batchId.toLowerCase().includes(query.toLowerCase()) ||
          b.productName.toLowerCase().includes(query.toLowerCase()) ||
          b.supplier.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (id: string) => {
    setQuery('');
    setDropdownOpen(false);
    navigate(`/inventory/${id}`);
  };

  const handleSelectBatch = (batchId: string) => {
    setQuery('');
    setDropdownOpen(false);
    navigate(`/batches/${batchId}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#EADDD0] bg-[#F6F2EA]/95 px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#3E2B22] hover:bg-[#EADDD0]/50"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <span className="font-bold tracking-tight text-[#1B1713]">TraceChain</span>
      </div>

      {/* Global Search with instant autocomplete */}
      <div ref={searchRef} className="relative flex-1 max-w-xl mx-auto lg:mx-0">
        <div className="relative flex items-center">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 text-[#7E7469]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setDropdownOpen(true);
            }}
            placeholder="Search products, batches or scan a QR code..."
            className="w-full rounded-2xl border border-[#E4D8CA] bg-[#EFEAE0]/80 py-2.5 pl-11 pr-4 text-sm text-[#1B1713] placeholder-[#8A8177] transition-all focus:border-[#6B734A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B734A]/20"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {dropdownOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-2xl border border-[#EADDD0] bg-white p-3 shadow-xl">
            {matchingProducts.length === 0 && matchingBatches.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#8A8177]">
                No matching products or batches found for &quot;{query}&quot;
              </div>
            ) : (
              <>
                {matchingProducts.length > 0 && (
                  <div className="mb-3">
                    <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8A8177]">
                      Products ({matchingProducts.length})
                    </p>
                    {matchingProducts.slice(0, 3).map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[#F6F2EA]"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package size={16} className="text-[#6B734A]" />
                          <div>
                            <p className="text-sm font-medium text-[#1B1713]">{prod.name}</p>
                            <p className="text-xs text-[#8A8177]">
                              {prod.sku} • {prod.category} • ₹{prod.sellingPrice}
                            </p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[#8A8177]" />
                      </button>
                    ))}
                  </div>
                )}

                {matchingBatches.length > 0 && (
                  <div>
                    <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8A8177]">
                      Batches ({matchingBatches.length})
                    </p>
                    {matchingBatches.slice(0, 4).map((batch) => (
                      <button
                        key={batch.batchId}
                        onClick={() => handleSelectBatch(batch.batchId)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[#F6F2EA]"
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers size={16} className="text-[#3E2B22]" />
                          <div>
                            <p className="text-sm font-medium text-[#1B1713] flex items-center gap-2">
                              <span>{batch.batchId}</span>
                              <span className="text-xs font-normal text-[#6B734A]">
                                ({batch.productName})
                              </span>
                            </p>
                            <p className="text-xs text-[#8A8177]">
                              Expires: {batch.expiryDate} ({batch.daysRemaining} days left) • Qty:{' '}
                              {batch.availableQuantity}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            batch.status === 'expired'
                              ? 'bg-red-100 text-red-700'
                              : batch.status === 'near_expiry'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {batch.status.replace('_', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick QR Scan Action Button */}
        <button
          onClick={() => openQRScanner()}
          className="flex items-center gap-2 rounded-xl border border-[#D5C6B5] bg-[#EFEAE0] px-3.5 py-2 text-xs font-medium text-[#1B1713] shadow-2xs hover:bg-[#E5DDCF] transition-colors"
          title="Scan Product or Batch QR"
        >
          <QrCode size={16} className="text-[#3E2B22]" />
          <span className="hidden sm:inline">Scan QR</span>
          <ChevronDown size={14} className="text-[#7E7469]" />
        </button>

        {/* Notifications Shortcut */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative rounded-xl p-2 text-[#3E2B22] hover:bg-[#EADDD0]/50 transition-colors"
          aria-label="View notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D32F2F] text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Retailer Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 rounded-full p-1 pr-2 hover:bg-[#EADDD0]/50 transition-colors"
            aria-label="Retailer Account Menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3E2B22] text-xs font-semibold text-white">
              R
            </div>
            <span className="hidden text-sm font-medium text-[#1B1713] md:inline">Retailer</span>
            <ChevronDown size={14} className="text-[#7E7469]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#EADDD0] bg-white p-2 shadow-xl z-50">
              <div className="border-b border-[#F0E6D8] px-3 py-2">
                <p className="text-xs font-semibold text-[#1B1713]">GreenMart Store</p>
                <p className="text-[11px] text-[#8A8177]">Hyperledger Fabric Node Online</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[#3E2B22] hover:bg-[#F6F2EA]"
                >
                  Store Settings
                </button>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/reports');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[#3E2B22] hover:bg-[#F6F2EA]"
                >
                  Export Reports
                </button>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[#D32F2F] hover:bg-red-50"
                >
                  Switch User / Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
