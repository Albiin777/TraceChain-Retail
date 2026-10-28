import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ChevronDown,
  LogOut,
  ShieldCheck,
  Store,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, setUser } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/dashboard' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Receive Stock', path: '/receive-stock' },
    { label: 'Sales & Billing', path: '/sales' },
    { label: 'Batch Tracking', path: '/batches' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Product History', path: '/product-history' },
    { label: 'Reports', path: '/reports' },
    { label: 'Settings', path: '/settings' },
  ];

  const handleRoleChange = (role: UserRole) => {
    setUser({
      ...user,
      role,
    });
    setUserMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[250px] shrink-0 h-screen flex-col justify-between bg-[#1B1713] text-white transition-transform duration-200 lg:static lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-bold tracking-tight text-white font-sans">
                  TraceChain
                </span>
              </div>
              <p className="mt-0.5 text-xs font-normal text-[#A39E98] tracking-wide">
                Retailer Portal
              </p>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded p-1 text-[#A39E98] hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 flex flex-col space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#3E4528] text-white shadow-xs'
                      : 'text-[#C5BEB5] hover:bg-[#28221D] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-2 w-2 rounded-full transition-all ${
                        isActive
                          ? 'bg-[#A7B27C] ring-4 ring-[#A7B27C]/20'
                          : 'bg-[#554E46] group-hover:bg-[#887F75]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="relative shrink-0 border-t border-[#2A241F] p-4 bg-[#1B1713]">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center justify-between rounded-xl p-2 text-left transition hover:bg-[#28221D]"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3E2B22] font-semibold text-white ring-1 ring-white/10">
                {user.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.storeName}</p>
                <p className="text-xs text-[#9B9389] capitalize">
                  {user.role === 'RETAILER_OWNER'
                    ? 'Retailer Owner'
                    : user.role === 'STORE_MANAGER'
                    ? 'Store Manager'
                    : 'Sales Staff'}
                </p>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-[#9B9389] transition-transform ${
                userMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 overflow-hidden rounded-xl border border-[#3E352B] bg-[#221C17] p-2 shadow-2xl">
              <div className="border-b border-[#352D25] px-3 py-2 text-xs text-[#999]">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="truncate text-[#888]">{user.email}</p>
              </div>
              <div className="py-1">
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#A39E98]">
                  Switch Role (RBAC Demo)
                </p>
                <button
                  onClick={() => handleRoleChange('RETAILER_OWNER')}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-left ${
                    user.role === 'RETAILER_OWNER'
                      ? 'bg-[#3E4528] text-white font-medium'
                      : 'text-[#DDD] hover:bg-[#2C241E]'
                  }`}
                >
                  <ShieldCheck size={14} /> Retailer Owner (Full Admin)
                </button>
                <button
                  onClick={() => handleRoleChange('STORE_MANAGER')}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-left ${
                    user.role === 'STORE_MANAGER'
                      ? 'bg-[#3E4528] text-white font-medium'
                      : 'text-[#DDD] hover:bg-[#2C241E]'
                  }`}
                >
                  <Store size={14} /> Store Manager
                </button>
                <button
                  onClick={() => handleRoleChange('SALES_STAFF')}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-left ${
                    user.role === 'SALES_STAFF'
                      ? 'bg-[#3E4528] text-white font-medium'
                      : 'text-[#DDD] hover:bg-[#2C241E]'
                  }`}
                >
                  <Store size={14} /> Sales Staff (Billing Only)
                </button>
              </div>
              <div className="border-t border-[#352D25] pt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[#E57373] hover:bg-[#2C241E]"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
