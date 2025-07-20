import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OfflineState {
  pendingInvoices: number;
}

const initialState: OfflineState = {
  pendingInvoices: 0,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setPendingInvoices(state, action: PayloadAction<number>) {
      state.pendingInvoices = action.payload;
    },
    incrementPending(state) {
      state.pendingInvoices += 1;
    },
    clearPending(state) {
      state.pendingInvoices = 0;
    },
  },
});

export const { setPendingInvoices, incrementPending, clearPending } =
  offlineSlice.actions;
export default offlineSlice.reducer;
