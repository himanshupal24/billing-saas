import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(businessId, lastInvoiceNumber = null) {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  
  if (!lastInvoiceNumber) {
    return `${prefix}-${year}-0001`;
  }

  // Extract number from last invoice (e.g., INV-2024-0042 -> 42)
  const match = lastInvoiceNumber.match(/-(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    const nextNum = (num + 1).toString().padStart(4, '0');
    return `${prefix}-${year}-${nextNum}`;
  }

  return `${prefix}-${year}-0001`;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(items, taxRate = 0) {
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subTotal * taxRate) / 100;
  const totalAmount = subTotal + taxAmount;

  return {
    subTotal: Math.round(subTotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

