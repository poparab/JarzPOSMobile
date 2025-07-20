import { CartItem } from '../store/cartSlice';

interface DeliveryInfo {
  cost: number;
}

export interface CartTotals {
  net: number;
  deliveryIncome: number;
  grandTotal: number;
}

export function computeCartTotals(
  cart: CartItem[],
  delivery?: DeliveryInfo | number,
): CartTotals {
  const net = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryIncome =
    delivery !== undefined
      ? typeof delivery === 'number'
        ? delivery
        : delivery.cost
      : 0;
  return {
    net,
    deliveryIncome,
    grandTotal: net + deliveryIncome,
  };
}
