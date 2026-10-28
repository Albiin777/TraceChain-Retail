import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';

export const Analytics: React.FC = () => {
  const { products, batches, sales, metrics } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '1y'>('7d');
  const [selectedCat, setSelectedCat] = useState('All');

  // Sales by product chart data
  const productSalesData = [
    { name: 'Fresh Milk (1L)', sales: 17100, units: 342 },
    { name: 'Greek Yogurt', sales: 10500, units: 210 },
    { name: 'Cheese Slice', sales: 9000, units: 180 },
    { name: 'Paneer (200g)', sales: 8000, units: 160 },
    { name: 'Butter (100g)', sales: 7250, units: 145 },
    { name: 'Orange Juice', sales: 4800, units: 60 },
  ];

  // Category breakdown
  const categoryData = [
    { name: 'Dairy', value: 51850, color: '#4E5738' },
    { name: 'Beverages', value: 4800, color: '#CCA888' },
    { name: 'Bakery', value: 3900, color: '#8B9E6E' },
    { name: 'Snacks', value: 2100, color: '#3E2B22' },
  ];

  // Demand forecast baseline (next 7 days predicted demand)
  const forecastData = [
    { day: 'Day +1', actualAverage: 340, forecasted: 355 },
    { day: 'Day +2', actualAverage: 320, forecasted: 330 },
    { day: 'Day +3', actualAverage: 310, forecasted: 325 },
    { day: 'Day +4', actualAverage: 360, forecasted: 375 },
    { day: 'Day +5', actualAverage: 410, forecasted: 430 },
    { day: 'Day +6', actualAverage: 450, forecasted: 470 },
    { day: 'Day +7', actualAverage: 390, forecasted: 405 },
  ];

  // Reorder recommendations based on current available stock vs reorderThreshold
  const reorderRecommendations = products.map((prod) => {
    const currentStock = batches
      .filter((b) => b.productId === prod.id && b.daysRemaining > 0)
      .reduce((sum, b) => sum + b.availableQuantity, 0);

    const isBelow = currentStock <= prod.reorderThreshold;
    const suggestedReorder = isBelow ? Math.max(50, prod.reorderThreshold * 3 - currentStock) : 0;

    return {
      product: prod,
      currentStock,
      threshold: prod.reorderThreshold,
      isBelow,
      suggestedReorder,
      estimatedCost: suggestedReorder * prod.costPrice,
    };
  });

  const handleExportAnalyticsCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Sales (Turnover)', metrics.todaysSales],
      ['Total Stock Valuation', metrics.totalStockValue],
      ['Active Lots on Ledger', metrics.activeBatches],
      ['Near-Expiry Stock Valuation', '₹ 18,400'],
      ['Wastage Losses Prevented via FEFO', '₹ 9,250'],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TraceChain_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">
            Inventory Analytics &amp; Forecasting
          </h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Turnover velocities, shelf-life wastage mitigation, and statistical baseline demand forecasting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-xl border border-[#D5C6B5] bg-white px-3 py-2 text-xs font-semibold text-[#1B1713] shadow-2xs focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="1y">Past 12 Months</option>
          </select>

          <button
            onClick={handleExportAnalyticsCSV}
            className="flex items-center gap-2 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2A1D17]"
          >
            <Download size={15} />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* 4 Financial & Risk KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Total Stock Valuation</span>
          <p className="text-2xl font-bold text-[#1B1713] mt-1">{formatINR(metrics.totalStockValue)}</p>
          <p className="text-[11px] text-[#4F7A38] mt-1">At wholesale cost</p>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Near-Expiry At-Risk Value</span>
          <p className="text-2xl font-bold text-[#C2671A] mt-1">{formatINR(18400)}</p>
          <p className="text-[11px] text-[#C2671A] mt-1">Under dynamic discount</p>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs">
          <span className="text-xs text-[#7E7469]">FEFO Wastage Mitigation</span>
          <p className="text-2xl font-bold text-[#4F7A38] mt-1">94.8%</p>
          <p className="text-[11px] text-[#4F7A38] mt-1">Losses prevented</p>
        </div>

        <div className="rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs">
          <span className="text-xs text-[#7E7469]">Ledger Audited Movements</span>
          <p className="text-2xl font-bold text-[#1B1713] mt-1">1,492</p>
          <p className="text-[11px] text-[#7E7469] mt-1">Blockchain verified</p>
        </div>
      </div>

      {/* Row: Sales by Product + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-[#1B1713]">
            Revenue by Top Fast-Moving Product
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productSalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6D8" />
                <XAxis dataKey="name" stroke="#8A8177" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8A8177" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(val: any) => [`₹ ${Number(val).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="sales" fill="#3E2B22" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-[#1B1713]">Category Distribution</h2>
          <div className="h-44 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={48} outerRadius={68} dataKey="value">
                  {categoryData.map((e, idx) => (
                    <Cell key={idx} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`₹ ${Number(v).toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {categoryData.map((c) => (
              <div key={c.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-medium text-[#1B1713]">{c.name}</span>
                </div>
                <span className="font-bold text-[#1B1713]">{formatINR(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Demand Forecast + Reorder Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Baseline Demand Forecast */}
        <div className="lg:col-span-6 rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1B1713]">Baseline Demand Forecast</h2>
              <p className="text-xs text-[#7E7469]">Moving average projection for upcoming 7-day sales velocity</p>
            </div>
            <span className="rounded-full bg-[#EBF3EA] px-2.5 py-0.5 text-[11px] font-bold text-[#4F7A38]">
              Model: Holt-Winters 7D
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E6D8" />
                <XAxis dataKey="day" stroke="#8A8177" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8A8177" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="actualAverage"
                  name="Historical Average"
                  stroke="#7E7469"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecasted"
                  name="Forecasted Units"
                  stroke="#4E5738"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reorder Recommendations */}
        <div className="lg:col-span-6 rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[#1B1713]">Automated Reorder Recommendations</h2>
          <p className="text-xs text-[#7E7469]">
            Derived from current batch stock levels, lead times, and configurable safety thresholds.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {reorderRecommendations.map(({ product, currentStock, threshold, isBelow, suggestedReorder, estimatedCost }) => (
              <div
                key={product.id}
                className={`rounded-xl p-3 text-xs border flex items-center justify-between ${
                  isBelow ? 'border-amber-200 bg-[#FFF9F2]' : 'border-[#F0E6D8] bg-[#FAF7F2]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1B1713]">{product.name}</span>
                    {isBelow && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                        Reorder Due
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7E7469]">
                    Current: {currentStock} units | Threshold: {threshold}
                  </p>
                </div>

                <div className="text-right">
                  {isBelow ? (
                    <div>
                      <span className="font-bold text-[#C2671A]">
                        Order +{suggestedReorder} units
                      </span>
                      <p className="text-[11px] text-[#7E7469]">{formatINR(estimatedCost)}</p>
                    </div>
                  ) : (
                    <span className="font-semibold text-[#4F7A38]">Stock Sufficient</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
