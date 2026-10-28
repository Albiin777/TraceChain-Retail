import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Store, UserCheck, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole, name: string) => {
    setUser({
      id: `user-${role.toLowerCase()}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@greenmart.in`,
      role,
      storeName: 'GreenMart Store',
      avatarInitials: 'G',
    });
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F2EA] p-6 text-[#1B1713]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#1B1713]">
            TraceChain
          </h1>
          <p className="mt-1 text-sm font-medium text-[#6B734A]">
            Retailer Inventory &amp; Blockchain Portal
          </p>
          <p className="mt-3 text-xs text-[#7E7469]">
            Select an authorized retailer credential to access the GreenMart Store portal:
          </p>
        </div>

        <div className="space-y-3 rounded-3xl border border-[#EADDD0] bg-white p-6 shadow-xl">
          <button
            onClick={() => handleSelectRole('RETAILER_OWNER', 'Albin Thomas')}
            className="flex w-full items-center justify-between rounded-2xl border border-[#CCE0C7] bg-[#FAF7F2] p-4 text-left transition hover:border-[#6B734A] hover:bg-[#EBF3EA]/60 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E2B22] text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B1713]">Albin Thomas</p>
                <p className="text-xs font-semibold text-[#4F7A38]">Retailer Owner (Full Access)</p>
                <p className="text-[11px] text-[#7E7469]">Catalog, Dynamic Pricing, Ledger</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-[#8A8177] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleSelectRole('STORE_MANAGER', 'Vikram Joshi')}
            className="flex w-full items-center justify-between rounded-2xl border border-[#EADDD0] bg-white p-4 text-left transition hover:border-[#6B734A] hover:bg-[#FAF7F2] group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B734A] text-white">
                <Store size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B1713]">Vikram Joshi</p>
                <p className="text-xs font-semibold text-[#3E2B22]">Store Manager</p>
                <p className="text-[11px] text-[#7E7469]">Stock Receiving, Batches &amp; Inventory</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-[#8A8177] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleSelectRole('SALES_STAFF', 'Pooja Verma')}
            className="flex w-full items-center justify-between rounded-2xl border border-[#EADDD0] bg-white p-4 text-left transition hover:border-[#6B734A] hover:bg-[#FAF7F2] group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7E7469] text-white">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1B1713]">Pooja Verma</p>
                <p className="text-xs font-semibold text-[#7E7469]">Sales Staff</p>
                <p className="text-[11px] text-[#7E7469]">FEFO Billing Terminal &amp; Receipts</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-[#8A8177] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="text-center text-xs text-[#8A8177]">
          Powered by Hyperledger Fabric Gateway &bull; GreenMart Node
        </div>
      </div>
    </div>
  );
};
