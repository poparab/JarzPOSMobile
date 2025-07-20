import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PosProfile } from '../api/posApi';

interface PosProfileState {
  selected: string | null;
  all: PosProfile[];
}

const initialState: PosProfileState = {
  selected: null,
  all: [],
};

const posProfileSlice = createSlice({
  name: 'posProfile',
  initialState,
  reducers: {
    setProfiles(state, action: PayloadAction<PosProfile[]>) {
      state.all = action.payload;
    },
    selectProfile(state, action: PayloadAction<string | null>) {
      state.selected = action.payload;
    },
    clearProfiles(state) {
      state.all = [];
      state.selected = null;
    },
  },
});

export const { setProfiles, selectProfile, clearProfiles } =
  posProfileSlice.actions;
export default posProfileSlice.reducer;
