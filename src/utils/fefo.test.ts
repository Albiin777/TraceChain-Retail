import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDaysRemaining, determineBatchStatus, calculateExpiryDiscount, allocateFefoStock, formatINR } from './fefo';
import { Batch, PricingRule } from '../types';

test('calculateDaysRemaining calculates correct diff from reference date', () => {
  const days1 = calculateDaysRemaining('2026-10-18', '2026-10-15');
  assert.equal(days1, 3);

  const days2 = calculateDaysRemaining('2026-10-15', '2026-10-15');
  assert.equal(days2, 0);

  const daysPast = calculateDaysRemaining('2026-10-10', '2026-10-15');
  assert.equal(daysPast, 0);
});

test('determineBatchStatus flags expired, near_expiry, low_stock and normal correctly', () => {
  assert.equal(determineBatchStatus('2026-10-14', 50, 15, '2026-10-15'), 'expired');
  assert.equal(determineBatchStatus('2026-10-18', 50, 15, '2026-10-15'), 'near_expiry');
  assert.equal(determineBatchStatus('2026-11-20', 10, 15, '2026-10-15'), 'low_stock');
  assert.equal(determineBatchStatus('2026-11-20', 40, 15, '2026-10-15'), 'normal');
});

test('calculateExpiryDiscount disallows expired sales and applies dynamic discounts', () => {
  const rules: PricingRule[] = [
    { id: '1', label: 'Critical 3 days left', minDaysRemaining: 1, maxDaysRemaining: 3, discountPercentage: 25, enabled: true },
    { id: '2', label: 'Near Expiry 4-7 days', minDaysRemaining: 4, maxDaysRemaining: 7, discountPercentage: 10, enabled: true },
  ];

  // Expired
  const resExpired = calculateExpiryDiscount(0, rules);
  assert.equal(resExpired.isEligibleForSale, false);

  // 2 days remaining -> 25% discount
  const res2Days = calculateExpiryDiscount(2, rules);
  assert.equal(res2Days.isEligibleForSale, true);
  assert.equal(res2Days.discountPercentage, 25);

  // 6 days remaining -> 10% discount
  const res6Days = calculateExpiryDiscount(6, rules);
  assert.equal(res6Days.isEligibleForSale, true);
  assert.equal(res6Days.discountPercentage, 10);

  // 30 days remaining -> 0% discount
  const res30Days = calculateExpiryDiscount(30, rules);
  assert.equal(res30Days.isEligibleForSale, true);
  assert.equal(res30Days.discountPercentage, 0);
});

test('allocateFefoStock prioritizes earliest expiring batches and avoids expired batches', () => {
  const mockBatches: Batch[] = [
    {
      batchId: 'BATCH_FAR',
      productId: 'P1',
      productName: 'Fresh Milk (1L)',
      manufacturingDate: '2026-10-10',
      expiryDate: '2026-10-25', // 10 days left
      supplier: 'Amul Dairy',
      quantityReceived: 100,
      quantitySold: 20,
      quantityReturned: 0,
      quantityWasted: 0,
      availableQuantity: 80,
      purchaseCost: 40,
      retailPrice: 50,
      currentCustodian: 'GreenMart Store',
      blockchainStatus: 'COMMITTED',
      txId: '0x123',
      blockNumber: 100,
      verifiedAt: '2026-10-10',
      status: 'normal',
      daysRemaining: 10,
    },
    {
      batchId: 'BATCH_EARLY',
      productId: 'P1',
      productName: 'Fresh Milk (1L)',
      manufacturingDate: '2026-10-05',
      expiryDate: '2026-10-17', // 2 days left -> earlier!
      supplier: 'Amul Dairy',
      quantityReceived: 50,
      quantitySold: 40,
      quantityReturned: 0,
      quantityWasted: 0,
      availableQuantity: 10,
      purchaseCost: 40,
      retailPrice: 50,
      currentCustodian: 'GreenMart Store',
      blockchainStatus: 'COMMITTED',
      txId: '0x124',
      blockNumber: 101,
      verifiedAt: '2026-10-05',
      status: 'near_expiry',
      daysRemaining: 2,
    },
    {
      batchId: 'BATCH_EXPIRED',
      productId: 'P1',
      productName: 'Fresh Milk (1L)',
      manufacturingDate: '2026-09-20',
      expiryDate: '2026-10-14', // Expired
      supplier: 'Amul Dairy',
      quantityReceived: 50,
      quantitySold: 45,
      quantityReturned: 0,
      quantityWasted: 0,
      availableQuantity: 5,
      purchaseCost: 40,
      retailPrice: 50,
      currentCustodian: 'GreenMart Store',
      blockchainStatus: 'COMMITTED',
      txId: '0x125',
      blockNumber: 99,
      verifiedAt: '2026-09-20',
      status: 'expired',
      daysRemaining: 0,
    },
  ];

  // Request 15 units. It should take 10 from BATCH_EARLY, then 5 from BATCH_FAR, and NEVER from BATCH_EXPIRED.
  const result = allocateFefoStock(mockBatches, 15);
  assert.equal(result.isFullySatisfied, true);
  assert.equal(result.allocations.length, 2);
  assert.equal(result.allocations[0].batchId, 'BATCH_EARLY');
  assert.equal(result.allocations[0].quantity, 10);
  assert.equal(result.allocations[1].batchId, 'BATCH_FAR');
  assert.equal(result.allocations[1].quantity, 5);
});

test('formatINR formats currency according to Indian denomination rules', () => {
  assert.equal(formatINR(12430), '₹ 12,430');
  assert.equal(formatINR(248900), '₹ 2,48,900');
  assert.equal(formatINR(500), '₹ 500');
});
