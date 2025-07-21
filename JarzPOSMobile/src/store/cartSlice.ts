import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  // Exported for utility functions
  id: string;
  name: string;
  price: number;
  qty: number;
  isBundle?: boolean;
  selectedItems?: { id: string; name: string }[];
  isDeliveryItem?: boolean;
}

export type { CartItem };

interface CartState {
  items: CartItem[];
  delivery_income: number;
  delivery_expense: number;
  customer_id?: string;
  city_name?: string;
}

const initialState: CartState = {
  items: [],
  delivery_income: 0,
  delivery_expense: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.qty += action.payload.qty;
      } else {
        state.items.push(action.payload);
      }
    },
    updateQty(state, action: PayloadAction<{ id: string; qty: number }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.qty = action.payload.qty;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
      state.delivery_income = 0;
      state.delivery_expense = 0;
      state.customer_id = undefined;
      state.city_name = undefined;
    },
    setDeliveryDetails(
      state,
      action: PayloadAction<{
        delivery_income: number;
        delivery_expense: number;
        customer_id: string;
        city_name: string;
      }>,
    ) {
      state.delivery_income = action.payload.delivery_income;
      state.delivery_expense = action.payload.delivery_expense;
      state.customer_id = action.payload.customer_id;
      state.city_name = action.payload.city_name;

      // Remove existing delivery income item
      state.items = state.items.filter((item) => !item.isDeliveryItem);

      // Add delivery income as cart item if > 0
      if (action.payload.delivery_income > 0) {
        state.items.push({
          id: 'delivery-income',
          name: 'Delivery Income',
          price: action.payload.delivery_income,
          qty: 1,
          isDeliveryItem: true,
        });
      }
    },
    removeDeliveryDetails(state) {
      state.delivery_income = 0;
      state.delivery_expense = 0;
      state.customer_id = undefined;
      state.city_name = undefined;
      state.items = state.items.filter((item) => !item.isDeliveryItem);
    },
  },
});

export const {
  addItem,
  updateQty,
  removeItem,
  clearCart,
  setDeliveryDetails,
  removeDeliveryDetails,
} = cartSlice.actions;
export default cartSlice.reducer;
