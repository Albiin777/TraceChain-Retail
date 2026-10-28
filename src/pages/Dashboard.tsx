import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ScanLine,
  PackagePlus,
  Receipt,
  Clock,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

// 7-Day Trend Data matching the screenshot exactly
const TREND_DATA_7D = [
  { day: 'Oct 9', sales: 7000, stockIn: 14500, stockOut: 8500 },
  { day: 'Oct 10', sales: 7500, stockIn: 7200, stockOut: 11500 },
  { day: 'Oct 11', sales: 7200, stockIn: 11000, stockOut: 17000 },
  { day: 'Oct 12', sales: 10000, stockIn: 5000, stockOut: 12000 },
  { day: 'Oct 13', sales: 7000, stockIn: 8000, stockOut: 8500 },
  { day: 'Oct 14', sales: 6000, stockIn: 10500, stockOut: 16000 },
  { day: 'Oct 15', sales: 10200, stockIn: 13000, stockOut: 18000 },
];

const TREND_DATA_30D = [
  { day: 'Week 1', sales: 52000, stockIn: 64000, stockOut: 58000 },
  { day: 'Week 2', sales: 61000, stockIn: 58000, stockOut: 62000 },
  { day: 'Week 3', sales: 58000, stockIn: 72000, stockOut: 67000 },
  { day: 'Week 4', sales: 77900, stockIn: 54900, stockOut: 61900 },
];

export const Dashboard: React.FC = () => {
  const { metrics, batches, openQRScanner } = useApp();
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');
  const navigate = useNavigate();

  // Stock status donut values from underlying batch dataset
  const donutData = [
    { name: 'Normal', value: 230, color: '#4E5738', percentage: '70%' },
    { name: 'Near Expiry (< 7 days)', value: 66, color: '#CCA888', percentage: '20%' },
    { name: 'Expired', value: 16, color: '#3E2B22', percentage: '5%' },
    { name: 'Low Stock', value: 16, color: '#A3B18A', percentage: '5%' },
  ];

  // Top selling products table
  const topProducts = [
    { name: 'Fresh Milk (1L)', unitsSold: 342, fillPct: '85%', revenue: 17100, icon: '🥛' },
    { name: 'Greek Yogurt', unitsSold: 210, fillPct: '55%', revenue: 10500, icon: '🥣' },
    { name: 'Cheese Slice', unitsSold: 180, fillPct: '45%', revenue: 9000, icon: '🧀' },
    { name: 'Paneer (200g)', unitsSold: 160, fillPct: '40%', revenue: 8000, icon: '📦' },
    { name: 'Butter (100g)', unitsSold: 145, fillPct: '35%', revenue: 7250, icon: '🧈' },
  ];

  // Batches needing attention
  const attentionBatches = [
    {
      product: 'Fresh Milk (1L)',
      batchNo: 'TCM00123',
      currentStock: 12,
      expiryDate: '18 Oct 2026',
      daysLeft: 3,
      status: 'Near Expiry',
      statusClass: 'bg-[#FFF3E8] text-[#C2671A] border-[#FFD9B3]',
      badgeDaysClass: 'bg-[#FFEDE0] text-[#D32F2F]',
    },
    {
      product: 'Paneer (200g)',
      batchNo: 'TCM00458',
      currentStock: 8,
      expiryDate: '20 Oct 2026',
      daysLeft: 5,
      status: 'Near Expiry',
      statusClass: 'bg-[#FFF3E8] text-[#C2671A] border-[#FFD9B3]',
      badgeDaysClass: 'bg-[#FFEDE0] text-[#E65100]',
    },
    {
      product: 'Yogurt (500g)',
      batchNo: 'TCM00876',
      currentStock: 25,
      expiryDate: '15 Oct 2026',
      daysLeft: 0,
      status: 'Expired',
      statusClass: 'bg-[#FDE8E8] text-[#D32F2F] border-[#F8B4B4]',
      badgeDaysClass: 'bg-[#FDE8E8] text-[#D32F2F]',
    },
    {
      product: 'Cheese Slice',
      batchNo: 'TCM00912',
      currentStock: 10,
      expiryDate: '22 Oct 2026',
      daysLeft: 7,
      status: 'Low Stock',
      statusClass: 'bg-[#EBF3EA] text-[#4F7A38] border-[#CCE0C7]',
      badgeDaysClass: 'bg-[#EBF3EA] text-[#4F7A38]',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Title and Timestamp Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-[#1B1713] tracking-tight">
            Good evening, GreenMart Store
          </h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Here&apos;s a snapshot of your inventory and sales today.
          </p>
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <p className="text-xs font-medium text-[#1B1713]">Thu, 16 Oct 2026</p>
          <div className="flex items-center sm:justify-end gap-1.5 mt-0.5 text-xs text-[#7E7469]">
            <span className="h-2 w-2 rounded-full bg-[#6B734A]" />
            <span>Last updated {metrics.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2/3 Content + Right 1/3 Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8-9 Column Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* A. 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="relative rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6B734A]" />
              <p className="text-xs font-medium text-[#7E7469]">Total Products</p>
              <p className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-[#1B1713]">
                {metrics.totalProducts}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-[#4F7A38]">↑ +12%</span>
                <span className="text-[#8A8177]">vs last week</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="relative rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6B734A]" />
              <p className="text-xs font-medium text-[#7E7469]">Active Batches</p>
              <p className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-[#1B1713]">
                {metrics.activeBatches}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-[#4F7A38]">↑ +8%</span>
                <span className="text-[#8A8177]">vs last week</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="relative rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6B734A]" />
              <p className="text-xs font-medium text-[#7E7469]">Today&apos;s Sales</p>
              <p className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-[#1B1713]">
                {formatINR(metrics.todaysSales)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-[#4F7A38]">↑ +15%</span>
                <span className="text-[#8A8177]">vs yesterday</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="relative rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6B734A]" />
              <p className="text-xs font-medium text-[#7E7469]">Total Stock Value</p>
              <p className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-[#1B1713]">
                {formatINR(metrics.totalStockValue)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-[#4F7A38]">↑ +6%</span>
                <span className="text-[#8A8177]">vs last month</span>
              </div>
            </div>
          </div>

          {/* B. Sales & Stock Trend Chart */}
          <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
              <h2 className="text-base font-bold text-[#1B1713]">Sales &amp; Stock Trend</h2>
              <div className="flex items-center gap-4">
                {/* Legend matching screenshot */}
                <div className="flex items-center gap-3 text-xs text-[#7E7469]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-xs bg-[#3E2B22]" />
                    <span>Sales</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-xs bg-[#EADDD0]" />
                    <span>Stock In</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#6B734A]" />
                    <span>Stock Out</span>
                  </div>
                </div>

                {/* Range Filter */}
                <select
                  value={trendRange}
                  onChange={(e) => setTrendRange(e.target.value as any)}
                  className="rounded-xl border border-[#E4D8CA] bg-[#F6F2EA] px-3 py-1.5 text-xs font-medium text-[#1B1713] focus:outline-none"
                  aria-label="Select trend period"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={trendRange === '7d' ? TREND_DATA_7D : TREND_DATA_30D}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6D8" />
                  <XAxis
                    dataKey="day"
                    stroke="#8A8177"
                    tick={{ fontSize: 11, fill: '#8A8177' }}
                    axisLine={{ stroke: '#EADDD0' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#8A8177"
                    tick={{ fontSize: 11, fill: '#8A8177' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val / 1000}K`}
                    domain={[0, 20000]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #EADDD0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`₹ ${Number(val).toLocaleString()}`, '']}
                  />
                  <Bar dataKey="sales" name="Sales" fill="#3E2B22" radius={[3, 3, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="stockIn" name="Stock In" fill="#EADDD0" radius={[3, 3, 0, 0]} maxBarSize={22} />
                  <Line
                    type="linear"
                    dataKey="stockOut"
                    name="Stock Out"
                    stroke="#6B734A"
                    strokeWidth={2}
                    dot={{ fill: '#6B734A', strokeWidth: 1, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* C & D. Stock Status + Top Selling Products (Two Cards Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* C. Stock Status Donut Card */}
            <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs overflow-hidden min-w-0">
              <h2 className="text-base font-bold text-[#1B1713]">Stock Status</h2>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                {/* Donut Chart with Center Text */}
                <div className="relative h-36 w-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius={44}
                        outerRadius={62}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-[#1B1713]">328</span>
                    <span className="text-[10px] text-[#7E7469]">Total Batches</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="flex-1 space-y-2 text-xs w-full min-w-0">
                  {donutData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[#3E2B22] font-medium truncate text-[11px]">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-right shrink-0 text-[11px]">
                        <span className="text-[#7E7469] w-7 text-right">{item.percentage}</span>
                        <span className="font-semibold text-[#1B1713] w-7 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* D. Top Selling Products */}
            <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs overflow-hidden min-w-0">
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-base font-bold text-[#1B1713]">Top Selling Products</h2>
                <div className="flex items-center gap-1 text-xs text-[#7E7469]">
                  <span>Last 7 days</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="grid grid-cols-12 text-[11px] font-semibold uppercase text-[#8A8177] pb-1 border-b border-[#F0E6D8]">
                  <span className="col-span-6">Product</span>
                  <span className="col-span-3 text-right">Units Sold</span>
                  <span className="col-span-3 text-right">Revenue</span>
                </div>

                {topProducts.map((p) => (
                  <div
                    key={p.name}
                    className="grid grid-cols-12 items-center text-xs py-1 hover:bg-[#F6F2EA]/60 rounded-lg px-1 transition-colors"
                  >
                    <div className="col-span-6 flex items-center gap-2 truncate">
                      <span className="text-sm">{p.icon}</span>
                      <span className="font-medium text-[#1B1713] truncate">{p.name}</span>
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <span className="text-[#1B1713] font-medium">{p.unitsSold}</span>
                      <div className="hidden sm:block w-12 h-2 rounded-full bg-[#EADDD0] overflow-hidden">
                        <div
                          className="h-full bg-[#5E6B43] rounded-full"
                          style={{ width: p.fillPct }}
                        />
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-semibold text-[#1B1713]">
                      {formatINR(p.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* F. Batches Needing Attention Table */}
          <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-base font-bold text-[#1B1713]">Batches Needing Attention</h2>
              <button
                onClick={() => navigate('/batches')}
                className="flex items-center gap-1 text-xs font-semibold text-[#3E2B22] hover:text-[#6B734A] transition-colors"
              >
                <span>View all</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EADDD0] text-[11px] font-semibold text-[#8A8177]">
                    <th className="pb-2.5 font-semibold">Product</th>
                    <th className="pb-2.5 font-semibold">Batch No.</th>
                    <th className="pb-2.5 font-semibold">Current Stock</th>
                    <th className="pb-2.5 font-semibold">Expiry Date</th>
                    <th className="pb-2.5 font-semibold text-center">Days Left</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D8]">
                  {attentionBatches.map((b) => (
                    <tr key={b.batchNo} className="hover:bg-[#F6F2EA]/70 transition-colors">
                      <td className="py-3 font-medium text-[#1B1713]">{b.product}</td>
                      <td className="py-3 font-mono text-[#7E7469]">{b.batchNo}</td>
                      <td className="py-3 text-[#1B1713]">{b.currentStock}</td>
                      <td className="py-3 text-[#7E7469]">{b.expiryDate}</td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${b.badgeDaysClass}`}
                        >
                          {b.daysLeft}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${b.statusClass}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/batches/${b.batchNo}`)}
                          className="rounded-xl border border-[#D5C6B5] bg-white px-3 py-1 text-xs font-medium text-[#1B1713] hover:bg-[#F6F2EA] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 3-4 Column Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* G. Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#1B1713]">Quick Actions</h2>

            {/* 1. Scan QR Code Primary Action */}
            <button
              onClick={() => openQRScanner()}
              className="flex w-full items-center justify-between rounded-2xl bg-[#3E2B22] p-4 text-left text-white shadow-xs hover:bg-[#2F2019] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ScanLine size={20} className="text-[#EADDD0]" />
                </div>
                <span className="text-sm font-semibold tracking-wide">Scan QR Code</span>
              </div>
              <ChevronRight
                size={18}
                className="text-[#EADDD0] transition-transform group-hover:translate-x-1"
              />
            </button>

            {/* 2. Receive New Stock */}
            <button
              onClick={() => navigate('/receive-stock')}
              className="flex w-full items-center justify-between rounded-2xl border border-[#EADDD0] bg-[#ECE5DA]/70 p-4 text-left text-[#1B1713] hover:bg-[#E4D9CC] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60">
                  <PackagePlus size={20} className="text-[#3E2B22]" />
                </div>
                <span className="text-sm font-semibold">Receive New Stock</span>
              </div>
              <ChevronRight
                size={18}
                className="text-[#7E7469] transition-transform group-hover:translate-x-1"
              />
            </button>

            {/* 3. Create New Sale */}
            <button
              onClick={() => navigate('/sales/new')}
              className="flex w-full items-center justify-between rounded-2xl border border-[#EADDD0] bg-[#ECE5DA]/70 p-4 text-left text-[#1B1713] hover:bg-[#E4D9CC] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60">
                  <Receipt size={20} className="text-[#3E2B22]" />
                </div>
                <span className="text-sm font-semibold">Create New Sale</span>
              </div>
              <ChevronRight
                size={18}
                className="text-[#7E7469] transition-transform group-hover:translate-x-1"
              />
            </button>

            {/* 4. View Near Expiry Batches */}
            <button
              onClick={() => navigate('/batches?status=near_expiry')}
              className="flex w-full items-center justify-between rounded-2xl border border-[#EADDD0] bg-[#ECE5DA]/70 p-4 text-left text-[#1B1713] hover:bg-[#E4D9CC] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60">
                  <Clock size={20} className="text-[#3E2B22]" />
                </div>
                <span className="text-sm font-semibold">View Near Expiry Batches</span>
              </div>
              <ChevronRight
                size={18}
                className="text-[#7E7469] transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* E. Alerts & Notifications */}
          <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8]">
              <h2 className="text-base font-bold text-[#1B1713]">Alerts &amp; Notifications</h2>
              <button
                onClick={() => navigate('/notifications')}
                className="text-xs font-semibold text-[#3E2B22] hover:text-[#6B734A]"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-[#F0E6D8]">
              {/* Alert 1 */}
              <button
                onClick={() => navigate('/batches?status=near_expiry')}
                className="flex w-full items-center justify-between py-3 text-left hover:bg-[#F6F2EA]/70 rounded-xl px-1 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#D32F2F] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#1B1713]">5 batches nearing expiry</p>
                    <p className="text-[11px] text-[#7E7469]">Expiring within 7 days</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#8A8177]" />
              </button>

              {/* Alert 2 */}
              <button
                onClick={() => navigate('/inventory?status=low_stock')}
                className="flex w-full items-center justify-between py-3 text-left hover:bg-[#F6F2EA]/70 rounded-xl px-1 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#E65100] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#1B1713]">Low stock for 3 products</p>
                    <p className="text-[11px] text-[#7E7469]">Consider reordering</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#8A8177]" />
              </button>

              {/* Alert 3 */}
              <button
                onClick={() => navigate('/batches?status=expired')}
                className="flex w-full items-center justify-between py-3 text-left hover:bg-[#F6F2EA]/70 rounded-xl px-1 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#D32F2F] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#1B1713]">2 products expired</p>
                    <p className="text-[11px] text-[#7E7469]">Remove from shelves</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#8A8177]" />
              </button>

              {/* Alert 4 */}
              <button
                onClick={() => navigate('/batches/TCM002451')}
                className="flex w-full items-center justify-between py-3 text-left hover:bg-[#F6F2EA]/70 rounded-xl px-1 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#4F7A38] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#1B1713]">New stock received</p>
                    <p className="text-[11px] text-[#7E7469]">Batch #TC02451 verified</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#8A8177]">2h ago</span>
              </button>
            </div>
          </div>

          {/* Bottom Promo Card: Scan a Product QR */}
          <div className="rounded-2xl bg-[#4E5738] p-6 text-white shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Scan a Product QR
              </h2>
              <p className="mt-1.5 text-xs text-[#E3E8D5] leading-relaxed">
                Verify product details, add to inventory or view complete history.
              </p>
            </div>

            <button
              onClick={() => openQRScanner()}
              className="flex w-full items-center justify-between rounded-xl bg-white p-3 text-left text-[#1B1713] shadow-sm hover:bg-[#F6F2EA] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <ScanLine size={18} className="text-[#3E2B22]" />
                <span className="text-xs font-bold tracking-tight">Open Scanner</span>
              </div>
              <ChevronRight
                size={16}
                className="text-[#7E7469] transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
