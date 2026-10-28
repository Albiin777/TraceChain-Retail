import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Package,
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  AlertTriangle,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';
import { formatINR } from '../utils/fefo';
import { Product } from '../types';

export const Inventory: React.FC = () => {
  const { products, batches, addProduct, user } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'low_stock' | 'normal'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  // Form state for adding new product
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Dairy',
    brand: '',
    uom: '1 Unit',
    sellingPrice: 50,
    costPrice: 40,
    reorderThreshold: 15,
    minTempC: 2,
    maxTempC: 8,
    description: '',
  });

  // Calculate stock per product from active non-expired batches
  const getProductStock = (productId: string) => {
    return batches
      .filter((b) => b.productId === productId && b.daysRemaining > 0)
      .reduce((sum, b) => sum + b.availableQuantity, 0);
  };

  const getProductBatchCount = (productId: string) => {
    return batches.filter((b) => b.productId === productId).length;
  };

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    const currentStock = getProductStock(p.id);
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'low_stock'
        ? currentStock <= p.reorderThreshold
        : currentStock > p.reorderThreshold;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Product ID', 'SKU', 'Name', 'Category', 'Brand', 'UOM', 'Retail Price', 'Stock Level', 'Reorder Threshold'];
    const rows = products.map((p) => [
      p.id,
      p.sku,
      `"${p.name}"`,
      p.category,
      `"${p.brand}"`,
      p.uom,
      p.sellingPrice,
      getProductStock(p.id),
      p.reorderThreshold,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TraceChain_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    addProduct({
      ...formData,
      status: 'active',
    });

    setIsAddModalOpen(false);
    setFormData({
      sku: '',
      name: '',
      category: 'Dairy',
      brand: '',
      uom: '1 Unit',
      sellingPrice: 50,
      costPrice: 40,
      reorderThreshold: 15,
      minTempC: 2,
      maxTempC: 8,
      description: '',
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">
            Inventory Management
          </h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Real-time stock levels, catalog SKUs, and blockchain-verified custody batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-[#D5C6B5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1B1713] shadow-2xs hover:bg-[#F6F2EA] transition"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {user.role !== 'SALES_STAFF' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#3E2B22] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2A1D17] transition"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-[#7E7469]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or brand..."
            className="w-full rounded-xl border border-[#E4D8CA] bg-[#F6F2EA] py-2 pl-9 pr-3 text-xs text-[#1B1713] focus:border-[#6B734A] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#7E7469] font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-[#E4D8CA] bg-[#F6F2EA] px-3 py-1.5 text-xs font-medium text-[#1B1713] focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#7E7469] font-medium">Stock:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-[#E4D8CA] bg-[#F6F2EA] px-3 py-1.5 text-xs font-medium text-[#1B1713] focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="normal">Adequate Stock</option>
              <option value="low_stock">Low Stock Alerts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-[#EADDD0] bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EADDD0] text-[#7E7469] font-semibold">
              <tr>
                <th className="py-3 px-4">Product Name &amp; SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Active Batches</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8]">
              {filteredProducts.map((p) => {
                const stock = getProductStock(p.id);
                const batchCount = getProductBatchCount(p.id);
                const isLow = stock <= p.reorderThreshold;

                return (
                  <tr key={p.id} className="hover:bg-[#F6F2EA]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-[#1B1713] text-sm block">{p.name}</span>
                        <span className="font-mono text-[11px] text-[#7E7469]">{p.sku}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#1B1713] font-medium">{p.category}</td>
                    <td className="py-3.5 px-4 text-[#7E7469]">{p.brand}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#1B1713]">
                      {formatINR(p.sellingPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-bold text-[#1B1713]">{stock}</span>
                      <span className="text-[11px] text-[#8A8177] ml-1">{p.uom}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#F6F2EA] px-2.5 py-1 font-semibold text-[#3E2B22]">
                        <Layers size={13} />
                        <span>{batchCount}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3E8] border border-[#FFD9B3] px-2.5 py-0.5 text-[11px] font-semibold text-[#C2671A]">
                          <AlertTriangle size={12} />
                          <span>Low Stock (&lt;{p.reorderThreshold})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#EBF3EA] border border-[#CCE0C7] px-2.5 py-0.5 text-[11px] font-semibold text-[#4F7A38]">
                          Adequate
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/inventory/${p.id}`)}
                          className="flex items-center gap-1 rounded-xl border border-[#D5C6B5] bg-white px-3 py-1.5 font-medium text-[#1B1713] hover:bg-[#F6F2EA] transition"
                        >
                          <Eye size={13} />
                          <span>Batches</span>
                        </button>
                        <button
                          onClick={() => navigate(`/receive-stock?productId=${p.id}`)}
                          className="rounded-xl bg-[#3E2B22] px-2.5 py-1.5 font-semibold text-white hover:bg-[#2A1D17] transition"
                          title="Receive Stock"
                        >
                          + Receive
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-[#EADDD0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
              <h2 className="text-lg font-bold text-[#1B1713]">Register New Product Catalog Item</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-[#8A8177] hover:bg-[#F6F2EA]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Buffalo Mozzarella"
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs focus:border-[#6B734A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    SKU / Barcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SKU-DRY-010"
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs focus:border-[#6B734A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Produce">Produce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Amul"
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Reorder Min
                  </label>
                  <input
                    type="number"
                    value={formData.reorderThreshold}
                    onChange={(e) => setFormData({ ...formData, reorderThreshold: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Min Temp (°C)
                  </label>
                  <input
                    type="number"
                    value={formData.minTempC}
                    onChange={(e) => setFormData({ ...formData, minTempC: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7E7469] mb-1">
                    Max Temp (°C)
                  </label>
                  <input
                    type="number"
                    value={formData.maxTempC}
                    onChange={(e) => setFormData({ ...formData, maxTempC: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D5C6B5] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F0E6D8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-[#D5C6B5] px-4 py-2 text-xs font-medium text-[#1B1713] hover:bg-[#F6F2EA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#3E2B22] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2A1D17]"
                >
                  Register Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
