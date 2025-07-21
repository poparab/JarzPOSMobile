import { configureStore, combineReducers } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import posReducer from './posSlice';
import posProfileReducer from './posProfileSlice';
import kanbanReducer from './kanbanSlice';
import settingsReducer from './settingsSlice';
import offlineReducer from './offlineSlice';
import customerReducer from './customerSlice';
import { posApi } from '../api/posApi';
import { customerApi } from '../api/customerApi';

// redux-persist for offline cache
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';

const rootReducer = combineReducers({
  cart: cartReducer,
  pos: posReducer,
  kanban: kanbanReducer,
  settings: settingsReducer,
  posProfile: posProfileReducer,
  offline: offlineReducer,
  customer: customerReducer,
  [posApi.reducerPath]: posApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [
    'cart',
    'offline',
    'posProfile',
    'customer',
    posApi.reducerPath,
    customerApi.reducerPath,
  ], // persist cart, profile & api cache
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }).concat(
      posApi.middleware,
      customerApi.middleware,
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
