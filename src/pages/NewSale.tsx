import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  QrCode,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatINR, calculateDaysRemaining, calculateExpiryDiscount } from '../utils/fefo';
import { Batch, Product, SaleItem } from '../types';

export const NewSale: React.FC = () => {
  const { products, batches, pricingRules, checkoutSale, openQRScanner, user } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  // If URL has batchId preselected from QR scanner or quick action
  useEffect(() => {
    const queryBatchId = searchParams.get('batchId');
    if (queryBatchId) {
      const b = batches.find((x) => x.batchId.toLowerCase() === queryBatchId.toLowerCase());
      if (b && b.availableQuantity > 0 && b.daysRemaining > 0) {
        addProductToCart(b.productId, b.batchId);
      }
    }
  }, [searchParams]);

  // Add product to cart with FEFO batch selection
  const addProductToCart = (productId: string, explicitBatchId?: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    // Filter available batches for this product
    const eligibleBatches = batches
      .filter((b) => b.productId === productId && b.availableQuantity > 0 && b.daysRemaining > 0 && b.status !== 'expired')
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    if (eligibleBatches.length === 0) {
      alert(`No eligible non-expired stock available for ${prod.name}.`);
      return;
    }

    // FEFO: Pick selected batch or earliest expiring batch
    const selectedBatch = explicitBatchId
      ? batches.find((b) => b.batchId === explicitBatchId) || eligibleBatches[0]
      : eligibleBatches[0];

    if (!selectedBatch || selectedBatch.daysRemaining <= 0) {
      alert('Selected batch is expired and cannot be sold per safety regulations.');
      return;
    }

    // Check if batch is already in cart
    const existingIndex = cart.findIndex((item) => item.batchId === selectedBatch.batchId);
    if (existingIndex >= 0) {
      const current = cart[existingIndex];
      if (current.quantity + 1 > selectedBatch.availableQuantity) {
        alert(`Cannot exceed available batch stock (${selectedBatch.availableQuantity} units).`);
        return;
      }
      updateQuantity(existingIndex, current.quantity + 1);
    } else {
      // Calculate dynamic expiry discount
      const discountInfo = calculateExpiryDiscount(selectedBatch.daysRemaining, pricingRules);
      const discountPct = discountInfo.discountPercentage;
      const discountAmount = (prod.sellingPrice * discountPct) / 100;
      const finalUnitPrice = prod.sellingPrice - discountAmount;

      const newItem: SaleItem = {
        productId: prod.id,
        productName: prod.name,
        batchId: selectedBatch.batchId,
        quantity: 1,
        unitPrice: prod.sellingPrice,
        discountPct,
        discountAmount,
        finalUnitPrice,
        lineTotal: finalUnitPrice,
        daysRemaining: selectedBatch.daysRemaining,
      };

      setCart((prev) => [...prev, newItem]);
    }
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeItem(index);
      return;
    }

    const item = cart[index];
    const b = batches.find((x) => x.batchId === item.batchId);
    const maxAvailable = b ? b.availableQuantity : 999;

    if (newQty > maxAvailable) {
      alert(`Cannot exceed available stock of ${maxAvailable} units for batch ${item.batchId}.`);
      return;
    }

    setCart((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...item,
        quantity: newQty,
        lineTotal: item.finalUnitPrice * newQty,
      };
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountTotal = cart.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0);
  const taxableAmount = subtotal - discountTotal;
  const taxTotal = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% GST
  const grandTotal = Math.round((taxableAmount + taxTotal) * 100) / 100;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const sale = await checkoutSale({
        items: cart,
        subtotal,
        discountTotal,
        taxTotal,
        grandTotal,
        paymentMethod,
        paymentStatus: 'PAID',
        cashier: user.name,
        timestamp: new Date().toLocaleString('en-IN') + ' IST',
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
      });

      setCompletedSale(sale);
      setCart([]);
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1713] tracking-tight">
            Point of Sale Terminal
          </h1>
          <p className="text-sm text-[#7E7469] mt-0.5">
            Automatic FEFO stock dispatch, dynamic shelf-life discounts, and GST invoice generation.
          </p>
        </div>

        <button
          onClick={() =>
            openQRScanner((code) => {
              const b = batches.find((x) => x.batchId.toLowerCase() === code.toLowerCase());
              if (b) addProductToCart(b.productId, b.batchId);
            })
          }
          className="flex items-center gap-2 rounded-xl border border-[#D5C6B5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1B1713] shadow-2xs hover:bg-[#F6F2EA]"
        >
          <QrCode size={16} className="text-[#3E2B22]" />
          <span>Scan Product Barcode / QR</span>
        </button>
      </div>

      {completedSale ? (
        /* Invoice Receipt Dialog */
        <div className="rounded-3xl border border-[#CCE0C7] bg-white p-8 max-w-2xl mx-auto shadow-xl space-y-6">
          <div className="text-center pb-4 border-b border-[#F0E6D8]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF3EA] text-[#4F7A38] mb-3">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="text-xl font-bold text-[#1B1713]">Sale Successfully Completed</h2>
            <p className="text-xs text-[#7E7469] mt-1">
              Invoice #{completedSale.invoiceNumber} • Payment via {completedSale.paymentMethod}
            </p>
          </div>

          {/* Receipt Body */}
          <div className="border border-[#EADDD0] rounded-2xl p-5 bg-[#FAF7F2] font-mono text-xs space-y-3">
            <div className="flex justify-between border-b border-[#EADDD0] pb-2 text-xs font-sans font-bold">
              <span>{user.storeName}</span>
              <span>GSTIN: 27AAAAA0000A1Z5</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {completedSale.items.map((it: SaleItem, idx: number) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div>
                    <span className="font-sans font-semibold text-[#1B1713]">{it.productName}</span>
                    <span className="text-[10px] text-[#7E7469] ml-2 font-mono">
                      [Batch: {it.batchId} • {it.daysRemaining}d left]
                    </span>
                  </div>
                  <span>
                    {it.quantity} x {formatINR(it.finalUnitPrice)} = {formatINR(it.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#EADDD0] pt-2 space-y-1 text-right">
              <div className="flex justify-between text-[#7E7469]">
                <span>Subtotal:</span>
                <span>{formatINR(completedSale.subtotal)}</span>
              </div>
              {completedSale.discountTotal > 0 && (
                <div className="flex justify-between text-[#C2671A]">
                  <span>Dynamic Expiry Savings:</span>
                  <span>-{formatINR(completedSale.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7E7469]">
                <span>GST (5%):</span>
                <span>{formatINR(completedSale.taxTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1B1713] pt-1 border-t border-[#EADDD0]">
                <span>Total Paid:</span>
                <span>{formatINR(completedSale.grandTotal)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#D5C6B5] pt-2 text-[10px] text-[#7E7469] space-y-0.5">
              <p>Hyperledger Fabric Tx: {completedSale.blockchainTxId}</p>
              <p>Cashier: {completedSale.cashier} • Date: {completedSale.timestamp}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className="rounded-xl border border-[#D5C6B5] bg-white px-4 py-2 text-xs font-semibold text-[#1B1713] hover:bg-[#F6F2EA]"
            >
              Print Receipt
            </button>
            <button
              onClick={() => setCompletedSale(null)}
              className="rounded-xl bg-[#3E2B22] px-6 py-2 text-xs font-semibold text-white hover:bg-[#2A1D17]"
            >
              Start Next Sale
            </button>
          </div>
        </div>
      ) : (
        /* Main POS Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Catalog & Batch Picker (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-[#7E7469]" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search catalog product to bill..."
                className="w-full rounded-2xl border border-[#E4D8CA] bg-white py-2.5 pl-9 pr-4 text-xs text-[#1B1713] focus:border-[#6B734A] focus:outline-none"
              />
            </div>

            {/* Product Quick-Select Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.sku.toLowerCase().includes(productSearch.toLowerCase())
                )
                .map((p) => {
                  // Find earliest expiring batch for FEFO preview
                  const pBatches = batches
                    .filter((b) => b.productId === p.id && b.availableQuantity > 0 && b.daysRemaining > 0)
                    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
                  const earliest = pBatches[0];
                  const totalAvail = pBatches.reduce((sum, b) => sum + b.availableQuantity, 0);

                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-[#EADDD0] bg-white p-4 shadow-2xs hover:border-[#6B734A] transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-[#1B1713] text-sm">{p.name}</h3>
                            <p className="text-[11px] text-[#7E7469]">{p.sku} • {p.uom}</p>
                          </div>
                          <span className="font-bold text-[#1B1713] text-sm">
                            {formatINR(p.sellingPrice)}
                          </span>
                        </div>

                        {earliest ? (
                          <div className="mt-3 rounded-xl bg-[#FAF7F2] p-2 text-[11px] space-y-0.5 border border-[#F0E6D8]">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[#4F7A38]">
                                FEFO Batch: {earliest.batchId}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 font-bold ${
                                  earliest.daysRemaining <= 3
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {earliest.daysRemaining}d left
                              </span>
                            </div>
                            <div className="flex justify-between text-[#7E7469]">
                              <span>Stock: {totalAvail} units</span>
                              {earliest.daysRemaining <= 3 && (
                                <span className="font-bold text-[#C2671A]">20% Expiry Discount</span>
                              )}
                              {earliest.daysRemaining > 3 && earliest.daysRemaining <= 7 && (
                                <span className="font-bold text-[#C2671A]">10% Expiry Discount</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-xl bg-red-50 p-2 text-[11px] text-red-700 font-semibold text-center">
                            Out of Eligible Stock
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addProductToCart(p.id)}
                        disabled={!earliest || totalAvail <= 0}
                        className="mt-3 w-full rounded-xl bg-[#3E2B22] py-2 text-xs font-semibold text-white hover:bg-[#2A1D17] transition disabled:opacity-40"
                      >
                        + Add to Sale Cart
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Checkout Cart (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#EADDD0] bg-white p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-[#3E2B22]" />
                <h2 className="text-base font-bold text-[#1B1713]">Current Sale Cart</h2>
              </div>
              <span className="text-xs font-semibold text-[#6B734A]">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8A8177]">
                Cart is empty. Select products from the left or scan a barcode to add.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.batchId}-${idx}`}
                    className="rounded-xl border border-[#EADDD0] bg-[#FAF7F2] p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-[#1B1713]">{item.productName}</p>
                        <p className="text-[11px] font-mono text-[#7E7469]">
                          Batch #{item.batchId} ({item.daysRemaining}d left)
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-[#8A8177] hover:text-red-600 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          className="h-6 w-6 rounded-lg bg-white border border-[#D5C6B5] flex items-center justify-center text-[#1B1713]"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="h-6 w-6 rounded-lg bg-white border border-[#D5C6B5] flex items-center justify-center text-[#1B1713]"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.discountPct > 0 && (
                          <span className="text-[10px] text-[#C2671A] font-semibold block">
                            {item.discountPct}% Dynamic Discount
                          </span>
                        )}
                        <span className="font-bold text-sm text-[#1B1713]">
                          {formatINR(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Details Form */}
            <div className="border-t border-[#F0E6D8] pt-3 space-y-2 text-xs">
              <span className="font-semibold text-[#7E7469]">Customer Info (Optional):</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl border border-[#D5C6B5] px-2.5 py-1.5 text-xs text-[#1B1713]"
                />
                <input
                  type="tel"
                  placeholder="Mobile (for e-receipt)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="rounded-xl border border-[#D5C6B5] px-2.5 py-1.5 text-xs text-[#1B1713]"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="border-t border-[#F0E6D8] pt-3 space-y-2 text-xs">
              <span className="font-semibold text-[#7E7469]">Payment Method:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'CARD', 'CASH'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${
                      paymentMethod === method
                        ? 'border-[#6B734A] bg-[#6B734A] text-white shadow-xs'
                        : 'border-[#D5C6B5] bg-white text-[#1B1713] hover:bg-[#F6F2EA]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="border-t border-[#F0E6D8] pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#7E7469]">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-[#C2671A] font-semibold">
                  <span>Dynamic Expiry Discount</span>
                  <span>-{formatINR(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7E7469]">
                <span>GST (5%)</span>
                <span>{formatINR(taxTotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1B1713] border-t border-[#EADDD0] pt-2">
                <span>Total Amount</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full rounded-xl bg-[#3E2B22] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#2A1D17] transition disabled:opacity-40"
            >
              {isCheckingOut ? 'Finalizing Invoice & Ledger Commit...' : `Complete Sale & Print Receipt (${formatINR(grandTotal)})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
