import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ScreenContainer, PrimaryButton } from '../components';
import { Surface } from 'react-native-paper';
import {
  List,
  ActivityIndicator,
  Portal,
  Dialog,
  Text,
  Switch,
} from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import io from 'socket.io-client';
import {
  useGetInvoicesQuery,
  useUpdateInvoiceStatusMutation,
  Invoice,
} from '../api/posApi';
import { usePos } from '../auth/PosContext';
import { API_BASE_URL } from '@env';

const COLUMNS = [
  'Received',
  'Processing',
  'Preparing',
  'Out for Delivery',
  'Completed',
] as const;

type Column = (typeof COLUMNS)[number];

interface BoardItem extends Invoice {}

export function KanbanScreen(): React.ReactElement {
  const { data: invoices = [], isLoading, refetch } = useGetInvoicesQuery();
  const [updateStatus] = useUpdateInvoiceStatusMutation();

  const [hideEmpty, setHideEmpty] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);

  const grouped = useMemo(() => {
    const map: Record<Column, BoardItem[]> = {
      Received: [],
      Processing: [],
      Preparing: [],
      'Out for Delivery': [],
      Completed: [],
    } as any;
    if (Array.isArray(invoices)) {
      invoices.forEach((inv) => {
        const col = (inv.status as Column) || 'Received';
        if (map[col]) map[col].push(inv);
      });
    }
    return map;
  }, [invoices]);

  const socketUrl = `${API_BASE_URL.replace(/https?:\/\//, '').split('/')[0]}`;

  useEffect(() => {
    // Connect to socket.io
    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('subscribe', 'jarz_pos_new_invoice');
      socket.emit('subscribe', 'jarz_pos_invoice_paid');
    });

    socket.on('msgprint', () => refetch());

    return () => {
      socket.disconnect();
    };
  }, [refetch]);

  const renderCard = useCallback(
    ({ item, drag }: RenderItemParams<BoardItem>) => (
      <List.Item
        title={item.name}
        description={`$${item.amount} · ${item.items} items`}
        onLongPress={drag}
        left={() => (
          <List.Icon icon="file-document" color={statusColor(item.status)} />
        )}
        onPress={() => setSelected(item)}
      />
    ),
    [],
  );

  async function handleDrop(item: Invoice, destStatus: Column) {
    if (item.status === destStatus) return;
    await updateStatus({ name: item.name, status: destStatus });
  }

  if (isLoading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator animating />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <Surface style={styles.toggleRow} elevation={0}>
        <Text>Hide empty columns</Text>
        <Switch value={hideEmpty} onValueChange={setHideEmpty} />
      </Surface>
      <FlashList
        horizontal
        data={COLUMNS.filter((c) => !hideEmpty || grouped[c].length)}
        estimatedItemSize={Dimensions.get('window').width}
        keyExtractor={(col) => col}
        renderItem={({ item: column }) => (
          <Surface style={styles.column} elevation={1}>
            <Text style={styles.columnTitle}>{column}</Text>
            <DraggableFlatList
              data={grouped[column]}
              keyExtractor={(i) => i.name}
              onDragEnd={({ data, from, to }) => {
                // Not changing order inside column; ignoring
              }}
              renderItem={(params) => renderCard(params)}
              onPlaceholderIndexChange={(idx) => {
                /* optional */
              }}
              onDragBegin={() => {}}
              containerStyle={{ flex: 1 }}
            />
          </Surface>
        )}
      />

      {/* Invoice dialog */}
      <Portal>
        <Dialog visible={!!selected} onDismiss={() => setSelected(null)}>
          <Dialog.Title>{selected?.name}</Dialog.Title>
          <Dialog.Content>
            <Text>Amount: ${selected?.amount}</Text>
            <Text>Items: {selected?.items}</Text>
            <Text>Status: {selected?.status}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <PrimaryButton
              onPress={() => {
                /* TODO: Print */
              }}
            >
              Print
            </PrimaryButton>
            <PrimaryButton
              onPress={() => {
                /* TODO: Mark Paid */
              }}
            >
              Mark Paid
            </PrimaryButton>
            <PrimaryButton onPress={() => setSelected(null)}>
              Close
            </PrimaryButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'Received':
      return '#2196f3';
    case 'Processing':
      return '#ff9800';
    case 'Preparing':
      return '#9c27b0';
    case 'Out for Delivery':
      return '#009688';
    case 'Completed':
      return '#4caf50';
    default:
      return '#607d8b';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  column: {
    width: Dimensions.get('window').width * 0.8,
    margin: 8,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 8,
  },
  columnTitle: { fontWeight: 'bold', marginBottom: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
});
