import { computeCartTotals } from '../src/utils/cartTotals';
import { deriveInvoiceState } from '../src/utils/invoiceState';
import { formatCurrency } from '../src/utils/currency';
import { resolveDeliveryExpense } from '../src/utils/delivery';

jest.mock('../src/api/axiosInstance', () => ({
  axiosInstance: {
    get: jest.fn(async () => ({ data: { cost: 50 } })),
  },
}));

describe('utils', () => {
  it('computeCartTotals calculates correctly', () => {
    const cart = [
      { id: 'A', name: 'A', price: 10, qty: 2 },
      { id: 'B', name: 'B', price: 5, qty: 1 },
    ];
    const totals = computeCartTotals(cart, 5);
    expect(totals).toEqual({ net: 25, deliveryIncome: 5, grandTotal: 30 });
  });

  it('deriveInvoiceState maps correctly', () => {
    expect(deriveInvoiceState({ status: 'Paid' })).toBe('Completed');
    expect(
      deriveInvoiceState({ sales_invoice_state: 'Out for Delivery' }),
    ).toBe('Out for Delivery');
  });

  it('formatCurrency respects locale', () => {
    const formatted = formatCurrency(10, 'USD', 'en-US');
    expect(formatted).toContain('$');
  });

  it('resolveDeliveryExpense caches result', async () => {
    const cost1 = await resolveDeliveryExpense('1');
    const cost2 = await resolveDeliveryExpense('1');
    expect(cost1).toBe(50);
    expect(cost2).toBe(50);
  });
});
