import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { dequeueInvoices } from './invoiceQueue';
import { useCreateInvoiceMutation } from '../api/posApi';

export function useInvoiceSync(): void {
  const [createInvoice] = useCreateInvoiceMutation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        const pending = await dequeueInvoices();
        for (const payload of pending) {
          try {
            await createInvoice(payload).unwrap();
          } catch {
            // if fails, re-enqueue? keep simple for now
          }
        }
      }
    });
    return unsubscribe;
  }, [createInvoice]);
}
