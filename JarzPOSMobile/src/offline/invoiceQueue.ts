import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  incrementPending,
  clearPending,
  setPendingInvoices,
} from '../store/offlineSlice';
import { store } from '../store/store';

const KEY = 'pendingInvoices';

export async function enqueueInvoice(
  payload: Record<string, unknown>,
): Promise<void> {
  const stored = await AsyncStorage.getItem(KEY);
  const list: Record<string, unknown>[] = stored ? JSON.parse(stored) : [];
  list.push(payload);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  store.dispatch(incrementPending());
}

export async function dequeueInvoices(): Promise<Record<string, unknown>[]> {
  const stored = await AsyncStorage.getItem(KEY);
  if (!stored) return [];
  const list: Record<string, unknown>[] = JSON.parse(stored);
  await AsyncStorage.removeItem(KEY);
  store.dispatch(clearPending());
  return list;
}

export async function loadPendingCount(): Promise<void> {
  const stored = await AsyncStorage.getItem(KEY);
  const count = stored ? JSON.parse(stored).length : 0;
  store.dispatch(setPendingInvoices(count));
}
