import { createSlice } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark';
}

const initialState: SettingsState = {
  theme: 'light',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
