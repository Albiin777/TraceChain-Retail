import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  ShieldCheck,
  Tag,
  Users,
  Sliders,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Server,
  Lock,
} from 'lucide-react';
import { PricingRule, UserRole } from '../types';
import { fabricGateway } from '../services/fabricService';

export const Settings: React.FC = () => {
  const { user, setUser, pricingRules, updatePricingRules } = useApp();
  const [activeTab, setActiveTab] = useState<'store' | 'pricing' | 'users' | 'blockchain'>('pricing');

  // Store profile form state
  const [storeForm, setStoreForm] = useState({
    storeName: 'GreenMart Store',
    legalName: 'GreenMart Fresh Foods & Retail Pvt Ltd',
    gstin: '27AAAAA0000A1Z5',
    fssai: '11521000000000',
    email: 'contact@greenmart.in',
    phone: '+91 22 4920 1888',
    address: 'Plot 42, Hiranandani Estate, Thane West, Mumbai, Maharashtra 400607',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
  });

  const [rules, setRules] = useState<PricingRule[]>(pricingRules);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New rule form
  const [newRule, setNewRule] = useState({
    label: '',
    minDays: 1,
    maxDays: 3,
    discountPct: 15,
  });

  const fabricStatus = fabricGateway.getStatus();

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setRules(updated);
    updatePricingRules(updated);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.label) return;
    const r: PricingRule = {
      id: `rule-${Date.now()}`,
      label: newRule.label,
      minDaysRemaining: newRule.minDays,
      maxDaysRemaining: newRule.maxDays,
      discountPercentage: newRule.discountPct,
      enabled: true,
    };
    const updated = [...rules, r];
    setRules(updated);
    updatePricingRules(updated);
    setNewRule({ label: '', minDays: 1, maxDays: 3, discountPct: 15 });
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    updatePricingRules(updated);
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ ...user, storeName: storeForm.storeName });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">System Settings</h1>
        <p className="text-sm text-[#7E7469] mt-0.5">
          Store entity configuration, dynamic shelf-life pricing engine, and Hyperledger Fabric network parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EADDD0] space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'pricing'
              ? 'border-[#6B734A] text-[#1B1713]'
              : 'border-transparent text-[#7E7469] hover:text-[#1B1713]'
          }`}
        >
          <Tag size={15} />
          <span>Dynamic Expiry Pricing Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'store'
              ? 'border-[#6B734A] text-[#1B1713]'
              : 'border-transparent text-[#7E7469] hover:text-[#1B1713]'
          }`}
        >
          <Store size={15} />
          <span>Store Profile &amp; GSTIN</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-[#6B734A] text-[#1B1713]'
              : 'border-transparent text-[#7E7469] hover:text-[#1B1713]'
          }`}
        >
          <Users size={15} />
          <span>Roles &amp; Permissions</span>
        </button>

        <button
          onClick={() => setActiveTab('blockchain')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'blockchain'
              ? 'border-[#6B734A] text-[#1B1713]'
              : 'border-transparent text-[#7E7469] hover:text-[#1B1713]'
          }`}
        >
          <Server size={15} />
          <span>Fabric Node Status</span>
        </button>
      </div>

      {/* Tab: Dynamic Pricing Rules */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#EADDD0] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0E6D8] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#1B1713]">
                  Shelf-Life Automated Discounting Engine
                </h2>
                <p className="text-xs text-[#7E7469]">
                  Applies dynamic price markdowns in POS checkout based on days remaining to expiry to prevent wastage.
                </p>
              </div>
              <span className="rounded-full bg-[#EBF3EA] px-3 py-1 text-xs font-bold text-[#4F7A38]">
                FEFO Policy Active
              </span>
            </div>

            {/* Rules list */}
            <div className="space-y-3">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-2xl border p-4 text-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    r.enabled ? 'border-[#CCE0C7] bg-[#FAF7F2]' : 'border-[#EADDD0] bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1B1713] text-sm">{r.label}</span>
                      <span className="rounded bg-[#3E2B22] px-2 py-0.5 text-[10px] font-bold text-white">
                        {r.discountPercentage}% OFF
                      </span>
                    </div>
                    <p className="text-[#7E7469]">
                      Triggered when remaining shelf life is between {r.minDaysRemaining} and{' '}
                      {r.maxDaysRemaining} days.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleRule(r.id)}
                      className={`rounded-xl px-3 py-1.5 font-semibold text-xs transition ${
                        r.enabled
                          ? 'bg-[#4F7A38] text-white shadow-xs'
                          : 'bg-[#D5C6B5] text-[#1B1713]'
                      }`}
                    >
                      {r.enabled ? 'Rule Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="rounded-lg p-1.5 text-[#8A8177] hover:text-red-600 transition"
                      title="Delete Rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new rule form */}
            <form
              onSubmit={handleAddRule}
              className="rounded-2xl border border-dashed border-[#D5C6B5] p-4 bg-[#F6F2EA]/50 space-y-3"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#7E7469]">
                Add Configurable Pricing Rule
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Rule label (e.g. Flash 48-hr discount)"
                  value={newRule.label}
                  onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
                  className="rounded-xl border border-[#D5C6B5] bg-white px-3 py-2 text-xs text-[#1B1713] sm:col-span-2"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    placeholder="Min days"
                    value={newRule.minDays}
                    onChange={(e) => setNewRule({ ...newRule, minDays: Number(e.target.value) })}
                    className="w-1/2 rounded-xl border border-[#D5C6B5] bg-white px-2 py-2 text-xs text-[#1B1713]"
                  />
                  <span className="text-xs text-[#7E7469]">-</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Max days"
                    value={newRule.maxDays}
                    onChange={(e) => setNewRule({ ...newRule, maxDays: Number(e.target.value) })}
                    className="w-1/2 rounded-xl border border-[#D5C6B5] bg-white px-2 py-2 text-xs text-[#1B1713]"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    placeholder="Discount %"
                    value={newRule.discountPct}
                    onChange={(e) => setNewRule({ ...newRule, discountPct: Number(e.target.value) })}
                    className="w-1/2 rounded-xl border border-[#D5C6B5] bg-white px-2 py-2 text-xs text-[#1B1713]"
                  />
                  <button
                    type="submit"
                    className="w-1/2 rounded-xl bg-[#3E2B22] text-xs font-semibold text-white hover:bg-[#2A1D17]"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Store Profile */}
      {activeTab === 'store' && (
        <form onSubmit={handleSaveStore} className="rounded-2xl border border-[#EADDD0] bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-[#F0E6D8] pb-3">
            <h2 className="text-base font-bold text-[#1B1713]">Retailer Legal Profile</h2>
            <p className="text-xs text-[#7E7469]">Used on printed invoices and Hyperledger Fabric MSP identity headers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#7E7469] mb-1">Store Display Name</label>
              <input
                type="text"
                value={storeForm.storeName}
                onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                className="w-full rounded-xl border border-[#D5C6B5] p-2.5 text-xs text-[#1B1713]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#7E7469] mb-1">Registered Legal Entity</label>
              <input
                type="text"
                value={storeForm.legalName}
                onChange={(e) => setStoreForm({ ...storeForm, legalName: e.target.value })}
                className="w-full rounded-xl border border-[#D5C6B5] p-2.5 text-xs text-[#1B1713]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#7E7469] mb-1">GST Identification Number (GSTIN)</label>
              <input
                type="text"
                value={storeForm.gstin}
                onChange={(e) => setStoreForm({ ...storeForm, gstin: e.target.value })}
                className="w-full rounded-xl border border-[#D5C6B5] p-2.5 text-xs font-mono text-[#1B1713]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#7E7469] mb-1">FSSAI Food License #</label>
              <input
                type="text"
                value={storeForm.fssai}
                onChange={(e) => setStoreForm({ ...storeForm, fssai: e.target.value })}
                className="w-full rounded-xl border border-[#D5C6B5] p-2.5 text-xs font-mono text-[#1B1713]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#7E7469] mb-1">Store Address</label>
              <input
                type="text"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                className="w-full rounded-xl border border-[#D5C6B5] p-2.5 text-xs text-[#1B1713]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#F0E6D8]">
            {savedSuccess ? (
              <span className="text-xs font-bold text-[#4F7A38]">Store details updated successfully.</span>
            ) : <span />}
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#3E2B22] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2A1D17]"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Users & Roles */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-[#F0E6D8] pb-3">
            <h2 className="text-base font-bold text-[#1B1713]">Staff Access &amp; RBAC Control</h2>
            <p className="text-xs text-[#7E7469]">Role-based permissions are enforced by backend validation schemas.</p>
          </div>

          <div className="space-y-3">
            {[
              { role: 'RETAILER_OWNER', label: 'Retailer Owner', desc: 'Full permissions: Catalog edit, dynamic pricing rules, stock receive, ledger sign-off, user accounts.' },
              { role: 'STORE_MANAGER', label: 'Store Manager', desc: 'Operational permissions: Stock receiving, batch tracking, inventory adjustments, and reports.' },
              { role: 'SALES_STAFF', label: 'Sales Staff', desc: 'Restricted permissions: POS sales billing, barcode scanning, customer receipts only.' },
            ].map((r) => (
              <div
                key={r.role}
                className={`rounded-2xl border p-4 text-xs flex items-center justify-between ${
                  user.role === r.role ? 'border-[#6B734A] bg-[#FAF7F2]' : 'border-[#EADDD0] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1B1713] text-sm">{r.label}</span>
                    {user.role === r.role && (
                      <span className="rounded-full bg-[#EBF3EA] px-2 py-0.2 text-[10px] font-bold text-[#4F7A38]">
                        ACTIVE SESSION
                      </span>
                    )}
                  </div>
                  <p className="text-[#7E7469] mt-0.5">{r.desc}</p>
                </div>

                <button
                  onClick={() => setUser({ ...user, role: r.role as UserRole })}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    user.role === r.role
                      ? 'bg-[#6B734A] text-white shadow-xs'
                      : 'border border-[#D5C6B5] bg-white hover:bg-[#F6F2EA]'
                  }`}
                >
                  {user.role === r.role ? 'Current Role' : 'Switch Role'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Blockchain Fabric Node */}
      {activeTab === 'blockchain' && (
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#1B1713]">
                Hyperledger Fabric Gateway Status
              </h2>
              <p className="text-xs text-[#7E7469]">
                Federated supply chain consortium network connection.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#EBF3EA] px-3 py-1 text-xs font-bold text-[#4F7A38]">
              <CheckCircle2 size={15} />
              <span>Gateway Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#EADDD0] space-y-1">
              <span className="font-sans text-[#7E7469] font-semibold text-[11px] block">Channel Name:</span>
              <span className="font-bold text-[#1B1713]">{fabricStatus.channel}</span>
            </div>
            <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#EADDD0] space-y-1">
              <span className="font-sans text-[#7E7469] font-semibold text-[11px] block">Smart Contract (Chaincode):</span>
              <span className="font-bold text-[#1B1713]">{fabricStatus.chaincode} v{fabricStatus.chaincodeVersion}</span>
            </div>
            <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#EADDD0] space-y-1">
              <span className="font-sans text-[#7E7469] font-semibold text-[11px] block">Organization MSP ID:</span>
              <span className="font-bold text-[#1B1713]">{fabricStatus.mspId}</span>
            </div>
            <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#EADDD0] space-y-1">
              <span className="font-sans text-[#7E7469] font-semibold text-[11px] block">Peer Node Endpoint:</span>
              <span className="font-bold text-[#1B1713]">{fabricStatus.peerEndpoint}</span>
            </div>
            <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#EADDD0] space-y-1">
              <span className="font-sans text-[#7E7469] font-semibold text-[11px] block">Current Block Height:</span>
              <span className="font-bold text-[#4F7A38]">#{fabricStatus.currentBlockHeight}</span>
            </div>
            <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#EADDD0] space-y-1">
              <span className="font-sans text-[#7E7469] font-semibold text-[11px] block">Gateway Mode:</span>
              <span className="font-bold text-[#3E2B22]">{fabricStatus.mode}</span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block mb-1">Data Separation &amp; Security Boundary:</span>
            Sensitive customer records, POS payments, and operational temporary state are preserved securely in PostgreSQL. Only cryptographic hashes of custody receipts, HTST pasteurization parameters, storage condition telemetry, and sale deduction proofs are committed to the immutable Hyperledger Fabric ledger.
          </div>
        </div>
      )}
    </div>
  );
};
