import { Batch, PricingRule, StockStatus } from '../types';

/**
 * Standard reference date for deterministic enterprise retail calculations (matches screenshot date Oct 15/16, 2026)
 */
export const REFERENCE_DATE = '2026-10-15';

/**
 * Calculates remaining days between reference date and expiry date
 */
export function calculateDaysRemaining(expiryDate: string, refDate: string = REFERENCE_DATE): number {
  const expiry = new Date(expiryDate).getTime();
  const ref = new Date(refDate).getTime();
  const diffDays = Math.ceil((expiry - ref) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Categorizes a batch status based on expiry and stock levels
 */
export function determineBatchStatus(
  expiryDate: string,
  availableQty: number,
  reorderThreshold: number = 15,
  refDate: string = REFERENCE_DATE
): StockStatus {
  const days = calculateDaysRemaining(expiryDate, refDate);
  if (days <= 0) return 'expired';
  if (days <= 7) return 'near_expiry';
  if (availableQty <= reorderThreshold) return 'low_stock';
  return 'normal';
}

/**
 * Dynamic Expiry-Based Pricing Calculator
 * Applies configured discount if product is nearing expiry, but prevents sale if expired.
 */
export function calculateExpiryDiscount(
  daysRemaining: number,
  rules: PricingRule[]
): { discountPercentage: number; isEligibleForSale: boolean; appliedRuleLabel?: string } {
  if (daysRemaining <= 0) {
    return {
      discountPercentage: 0,
      isEligibleForSale: false,
      appliedRuleLabel: 'Product has expired and cannot be sold',
    };
  }

  // Find highest enabled matching rule
  const matchedRule = rules
    .filter((r) => r.enabled && daysRemaining >= r.minDaysRemaining && daysRemaining <= r.maxDaysRemaining)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

  if (matchedRule) {
    return {
      discountPercentage: matchedRule.discountPercentage,
      isEligibleForSale: true,
      appliedRuleLabel: matchedRule.label,
    };
  }

  return {
    discountPercentage: 0,
    isEligibleForSale: true,
    appliedRuleLabel: 'Standard Retail Price',
  };
}

/**
 * First Expired, First Out (FEFO) Batch Allocation Engine
 * Sorts batches by earliest non-expired expiry date, then allocates the requested quantity.
 */
export function allocateFefoStock(
  batches: Batch[],
  requestedQty: number
): {
  allocations: { batchId: string; batch: Batch; quantity: number; unitPrice: number; discountPct: number }[];
  isFullySatisfied: boolean;
  unfulfilledQuantity: number;
} {
  if (requestedQty <= 0) {
    return { allocations: [], isFullySatisfied: true, unfulfilledQuantity: 0 };
  }

  // Filter out expired batches and batches with 0 stock
  const eligibleBatches = batches
    .filter((b) => b.availableQuantity > 0 && b.daysRemaining > 0 && b.status !== 'expired')
    .sort((a, b) => {
      const timeA = new Date(a.expiryDate).getTime();
      const timeB = new Date(b.expiryDate).getTime();
      return timeA - timeB; // Earliest expiry first
    });

  let remainingToFulfill = requestedQty;
  const allocations: { batchId: string; batch: Batch; quantity: number; unitPrice: number; discountPct: number }[] = [];

  for (const batch of eligibleBatches) {
    if (remainingToFulfill <= 0) break;

    const allocQty = Math.min(batch.availableQuantity, remainingToFulfill);
    allocations.push({
      batchId: batch.batchId,
      batch,
      quantity: allocQty,
      unitPrice: batch.retailPrice,
      discountPct: batch.daysRemaining <= 3 ? 20 : batch.daysRemaining <= 7 ? 10 : 0,
    });

    remainingToFulfill -= allocQty;
  }

  return {
    allocations,
    isFullySatisfied: remainingToFulfill === 0,
    unfulfilledQuantity: Math.max(0, remainingToFulfill),
  };
}

/**
 * Formats Indian Rupee (INR) currency properly (e.g. ₹ 2,48,900)
 */
export function formatINR(val: number): string {
  const parts = Math.round(val).toString();
  const lastThree = parts.substring(parts.length - 3);
  const otherNumbers = parts.substring(0, parts.length - 3);
  const formatted = otherNumbers !== '' ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return `₹ ${formatted}`;
}
