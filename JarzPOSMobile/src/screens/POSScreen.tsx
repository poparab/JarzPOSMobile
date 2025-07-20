import React, { useMemo, useState } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { Surface } from 'react-native-paper';
import {
  Appbar,
  Badge,
  Searchbar,
  List,
  IconButton,
  Portal,
  Modal,
  Button,
  Snackbar,
  ActivityIndicator,
  useTheme,
  Text,
} from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { usePos } from '../auth/PosContext';
import {
  useGetProductsByProfileQuery,
  useGetBundlesByProfileQuery,
  useCreateInvoiceMutation,
  Product,
  Bundle,
} from '../api/posApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addItem, removeItem, updateQty, clearCart } from '../store/cartSlice';
import axios from 'axios';
import { enqueueInvoice } from '../offline/invoiceQueue';
import { ItemCard } from '../components/ItemCard';
import { ScreenContainer, PrimaryButton } from '../components';
import { BundleSelectionModal } from '../components/BundleSelectionModal';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export function POSScreen(): React.ReactElement {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.cart.items);

  const cartMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((c) => (map[c.id] = c.qty));
    return map;
  }, [cart]);
  const pending = useAppSelector((s) => s.offline.pendingInvoices);
  const { profile } = usePos();

  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  const {
    data: products = [],
    isFetching: fetchingProducts,
  } = useGetProductsByProfileQuery(profile!, {
    skip: !profile,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: bundles = [],
    isFetching: fetchingBundles,
  } = useGetBundlesByProfileQuery(profile!, {
    skip: !profile,
    refetchOnMountOrArgChange: true,
  });
  const [createInvoice, { isLoading: loadingInvoice }] =
    useCreateInvoiceMutation();

  console.log('Bundles from API:', bundles);

  const listData = useMemo(() => {
    const data: ([string, (Product[] | Bundle[])])[] = [];

    const filteredBundles = bundles.filter(
      (b) => !search || b.name.toLowerCase().includes(search.toLowerCase()),
    );

    if (filteredBundles.length > 0) {
      data.push(['Bundles', filteredBundles]);
    }

    const productMap: Record<string, Product[]> = {};
    products.forEach((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return;
      if (!productMap[p.item_group]) productMap[p.item_group] = [];
      productMap[p.item_group].push(p);
    });

    Object.entries(productMap).forEach((entry) => data.push(entry));

    return data;
  }, [products, bundles, search]);

  function handleAdd(item: {
    id: string;
    name: string;
    price: number;
    isBundle?: boolean;
    item_groups?: any[];
  }) {
    if (item.isBundle) {
      setSelectedBundle(item as Bundle);
    } else {
    dispatch(addItem({ ...item, qty: 1 } as any));
  }
  }

  const handleBundleSelect = (bundle: Bundle, selectedItems: Product[]) => {
    dispatch(addItem({
      id: bundle.id,
      name: bundle.name,
      price: bundle.price,
      isBundle: true,
      selectedItems: selectedItems,
      qty: 1
    } as any));
    setSelectedBundle(null);
  };

  async function handleCheckout() {
    const payload = {
      items: cart.map((i) => ({
        item_code: i.id,
        qty: i.qty,
        ...(i.isBundle && { selected_items: i.selectedItems.map(si => si.id) })
      })),
    };
    try {
      await createInvoice(payload).unwrap();
      dispatch(clearCart());
      setToast('Invoice created successfully');
    } catch (e) {
      if (axios.isAxiosError(e) && !e.response) {
        await enqueueInvoice(payload);
        dispatch(clearCart());
        setToast('Invoice queued (offline)');
      } else {
        setToast('Error creating invoice');
      }
    }
  }

  if (fetchingProducts || fetchingBundles) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator animating />
      </ScreenContainer>
    );
  }

  const navigation = useNavigation();

  return (
    <ScreenContainer>
      <Appbar.Header>
        <IconButton
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
        <Appbar.Content title="Jarz POS" />
        {pending > 0 && (
          <Badge style={{ marginRight: 8 }}>{pending}</Badge>
        )}
      </Appbar.Header>

      <View style={styles.container}>
        <View style={styles.mainContent}>
      <Searchbar
        placeholder="Search items or bundles"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

          <FlashList
            data={listData}
        estimatedItemSize={300}
        keyExtractor={(it: any) => it[0]}
            renderItem={({ item: [group, items] }: { item: [string, any[]] }) => {
              const isBundleGroup = group === 'Bundles';
              return (
                <Surface elevation={0}>
            <List.Subheader>{group}</List.Subheader>
            <FlashList
                    data={items}
              numColumns={2}
              estimatedItemSize={140}
              keyExtractor={(p: any) => p.id}
              renderItem={({ item }: { item: any }) => (
                <ItemCard
                  name={item.name}
                  price={item.price}
                        qty={isBundleGroup ? undefined : item.qty}
                  inCart={cartMap[item.id]}
                        onPress={() => handleAdd({ ...item, isBundle: isBundleGroup })}
                        onAdd={() => dispatch(addItem({ ...item, qty: 1 }))}
                        onRemove={() => dispatch(updateQty({ id: item.id, qty: (cartMap[item.id] || 1) - 1 }))}
                />
              )}
                  />
                </Surface>
              );
            }}
            />
          </View>

        <View style={styles.cartContainer}>
          <Text style={styles.drawerTitle}>Cart</Text>
            <FlashList
              data={cart}
              estimatedItemSize={60}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                description={`Qty: ${item.qty}`}
                right={() => (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <IconButton
                        icon="minus"
                      onPress={() => dispatch(updateQty({ id: item.id, qty: item.qty - 1 }))}
                      />
                      <IconButton
                        icon="plus"
                      onPress={() => dispatch(updateQty({ id: item.id, qty: item.qty + 1 }))}
                    />
                    <IconButton
                      icon="delete"
                      onPress={() => dispatch(removeItem(item.id))}
                      />
                    </View>
                  )}
                />
              )}
            />
          <PrimaryButton
            onPress={handleCheckout}
            loading={loadingInvoice}
            disabled={!cart.length || loadingInvoice}
            style={{ marginTop: 12 }}
          >
            Checkout
          </PrimaryButton>
        </View>
      </View>

      {selectedBundle && (
        <BundleSelectionModal
          bundle={selectedBundle}
          onClose={() => setSelectedBundle(null)}
          onSelect={handleBundleSelect}
        />
      )}

      <Snackbar
        visible={!!toast}
        onDismiss={() => setToast(null)}
        duration={3000}
      >
        {toast}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 2,
  },
  cartContainer: {
    flex: 1,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },
  search: { margin: 8 },
  bundleList: { paddingLeft: 8 },
  drawer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignSelf: 'center',
    width: '80%',
    maxHeight: '80%',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});
