import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';

export const Notifications: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsRead } = useApp();
  const [filterType, setFilterType] = useState<string>('All');
  const navigate = useNavigate();

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'All') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const getSeverityIcon = (type: string, severity: string) => {
    switch (type) {
      case 'EXPIRY':
      case 'EXPIRED':
        return <span className="h-3 w-3 rounded-full bg-[#D32F2F] shrink-0" />;
      case 'LOW_STOCK':
        return <span className="h-3 w-3 rounded-full bg-[#E65100] shrink-0" />;
      case 'RECEIPT':
        return <span className="h-3 w-3 rounded-full bg-[#4F7A38] shrink-0" />;
      case 'BLOCKCHAIN':
        return <ShieldCheck size={16} className="text-[#6B734A] shrink-0" />;
      default:
        return <span className="h-3 w-3 rounded-full bg-[#7E7469] shrink-0" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">Notification Center</h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Operational warnings, cold chain alerts, expiry triggers, and ledger confirmations.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="flex items-center gap-1.5 rounded-xl border border-[#D5C6B5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1B1713] hover:bg-[#F6F2EA] transition"
        >
          <Check size={14} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['All', 'unread', 'EXPIRY', 'LOW_STOCK', 'RECEIPT', 'BLOCKCHAIN'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              filterType === cat
                ? 'bg-[#3E2B22] text-white shadow-xs'
                : 'border border-[#D5C6B5] bg-white text-[#1B1713] hover:bg-[#F6F2EA]'
            }`}
          >
            {cat === 'unread' ? 'Unread Only' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-[#EADDD0] bg-white shadow-2xs divide-y divide-[#F0E6D8] overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7E7469]">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`flex items-start justify-between p-4 cursor-pointer transition hover:bg-[#F6F2EA]/80 ${
                !n.read ? 'bg-[#FAF7F2]' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getSeverityIcon(n.type, n.severity)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1B1713]">{n.title}</h3>
                    {!n.read && (
                      <span className="rounded-full bg-[#6B734A] px-2 py-0.2 text-[10px] font-bold text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7E7469] mt-0.5">{n.description}</p>
                  <p className="text-[11px] text-[#8A8177] mt-1.5 flex items-center gap-1">
                    <Clock size={12} />
                    <span>{n.timestamp}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B734A]">
                <span className="hidden sm:inline">View Details</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
