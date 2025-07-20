import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PosState {
  activeSessionId: string | null;
}

const initialState: PosState = {
  activeSessionId: null,
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<string>) {
      state.activeSessionId = action.payload;
    },
    endSession(state) {
      state.activeSessionId = null;
    },
  },
});

export const { startSession, endSession } = posSlice.actions;
export default posSlice.reducer;
