import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../api/customerApi';

interface CustomerState {
  selectedCustomer: Customer | null;
  isCustomerRequired: boolean;
}

const initialState: CustomerState = {
  selectedCustomer: null,
  isCustomerRequired: true,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    setCustomerRequired: (state, action: PayloadAction<boolean>) => {
      state.isCustomerRequired = action.payload;
    },
  },
});

export const {
  setSelectedCustomer,
  clearSelectedCustomer,
  setCustomerRequired,
} = customerSlice.actions;
export default customerSlice.reducer;
