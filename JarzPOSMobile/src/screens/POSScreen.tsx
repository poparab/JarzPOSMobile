import React, { useMemo, useState } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { Surface } from 'react-native-paper';
import {
  Appbar,
  Badge,
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
import { addItem, removeItem, updateQty, clearCart, setDeliveryDetails } from '../store/cartSlice';
import axios from 'axios';
import { enqueueInvoice } from '../offline/invoiceQueue';
import { ItemCard } from '../components/ItemCard';
import { ScreenContainer, PrimaryButton, CustomerSelector, CustomerDetails, Cart } from '../components';
import { BundleSelectionModal } from '../components/BundleSelectionModal';
import { ApiTestModal } from '../components/ApiTestModal';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useSubmitInvoiceMutation } from '../api/customerApi';

export function POSScreen(): React.ReactElement {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const cartState = useAppSelector((s) => s.cart);
  const { items: cart } = cartState;
  const selectedCustomer = useAppSelector((s) => s.customer.selectedCustomer);

  const cartMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((c) => (map[c.id] = c.qty));
    return map;
  }, [cart]);
  const pending = useAppSelector((s) => s.offline.pendingInvoices);
  const { profile } = usePos();

  console.log('🏪 [POSScreen] Current profile:', profile);

  const [toast, setToast] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showApiTest, setShowApiTest] = useState(false);

  const {
    data: products = [],
    isFetching: fetchingProducts,
    error: productsError,
  } = useGetProductsByProfileQuery(profile!, {
    skip: !profile,
    refetchOnMountOrArgChange: false, // Reduced to false for better performance
  });
  const {
    data: bundles = [],
    isFetching: fetchingBundles,
    error: bundlesError,
  } = useGetBundlesByProfileQuery(profile!, {
    skip: !profile,
    refetchOnMountOrArgChange: false, // Reduced to false for better performance
  });
  const [createInvoice, { isLoading: loadingInvoice }] =
    useCreateInvoiceMutation();
  const [submitInvoice, { isLoading: loadingInvoiceSubmission }] = 
    useSubmitInvoiceMutation();

  console.log('Bundles from API:', bundles);
  console.log('🔧 [POSScreen] Products:', products.length, 'fetching:', fetchingProducts, 'error:', productsError);
  console.log('🎁 [POSScreen] Bundles:', bundles.length, 'fetching:', fetchingBundles, 'error:', bundlesError);

    const listData = useMemo(() => {
    const data: [string, any[]][] = [];
    const productMap: Record<string, any[]> = {};

    if (bundles.length > 0) {
      data.push(['Bundles', bundles]);
    }

    products.forEach((p) => {
      if (!productMap[p.item_group]) productMap[p.item_group] = [];
      productMap[p.item_group].push(p);
    });

    Object.entries(productMap).forEach((entry) => data.push(entry));

    return data;
  }, [products, bundles]);

  function handleAdd(item: {
    id: string;
    name: string;
    price: number;
    isBundle?: boolean;
    item_groups?: any[];
  }) {
    if (!selectedCustomer) {
      setToast('Please select a customer before adding items to cart');
      return;
    }
    
    if (item.isBundle) {
      setSelectedBundle(item as Bundle);
    } else {
      dispatch(addItem({ ...item, qty: 1 } as any));
    }
  }

  const handleDeliveryDetails = (details: {
    delivery_income: number;
    delivery_expense: number;
    customer_id: string;
    city_name: string;
  }) => {
    console.log('🚚 [POSScreen] Setting delivery details:', details);
    dispatch(setDeliveryDetails(details));
  };

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
    if (!selectedCustomer) {
      setToast('Please select a customer before checkout');
      return;
    }

    if (!cartState.customer_id || !cartState.city_name) {
      setToast('Customer delivery details are not available');
      return;
    }

    const invoiceData = {
      customer_id: cartState.customer_id,
      city_name: cartState.city_name,
      delivery_income: cartState.delivery_income,
      delivery_expense: cartState.delivery_expense,
      cart_items: cart.map((i) => ({
        item_code: i.id,
        qty: i.qty,
        price: i.price,
        total: i.price * i.qty,
        ...(i.isBundle && i.selectedItems && { selected_items: i.selectedItems.map((si: any) => si.id) })
      })),
    };

    try {
      console.log('📄 [POSScreen] Submitting invoice:', invoiceData);
      await submitInvoice(invoiceData).unwrap();
      dispatch(clearCart());
      setToast('Invoice submitted successfully');
    } catch (e) {
      console.error('❌ [POSScreen] Error submitting invoice:', e);
      if (axios.isAxiosError(e) && !e.response) {
        // Fallback to old invoice creation for offline support
        const fallbackPayload = {
          items: cart.map((i) => ({
            item_code: i.id,
            qty: i.qty,
            ...(i.isBundle && i.selectedItems && { selected_items: i.selectedItems.map((si: any) => si.id) })
          })),
        };
        await enqueueInvoice(fallbackPayload);
        dispatch(clearCart());
        setToast('Invoice queued (offline)');
      } else {
        setToast('Error submitting invoice');
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

  return (
    <ScreenContainer>
      <Appbar.Header>
        <IconButton
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
        <Appbar.Content title="Jarz POS" />
                  {pending > 0 && (
            <Badge
              style={{ position: 'absolute', right: 10, top: 10 }}
              visible={true}
            >
              {pending}
            </Badge>
          )}
          <IconButton
            icon="api"
            size={24}
            iconColor={theme.colors.primary}
            onPress={() => setShowApiTest(true)}
            style={{ position: 'absolute', right: 50, top: 10 }}
          />
        </Appbar.Header>

      <View style={styles.container}>
        <View style={styles.mainContent}>
          <CustomerSelector />
          {selectedCustomer && (
            <CustomerDetails 
              customer={selectedCustomer} 
              onDeliveryDetails={handleDeliveryDetails}
            />
          )}

          <FlashList
            data={listData}
            estimatedItemSize={200}
            keyExtractor={(it: any) => it[0]}
            renderItem={({ item: [group, items] }: { item: [string, any[]] }) => {
              const isBundleGroup = group === 'Bundles';
              return (
                <Surface elevation={0}>
                  <List.Subheader>{group}</List.Subheader>
                  <FlashList
                    data={items}
                    numColumns={isBundleGroup ? 6 : 8}
                    estimatedItemSize={isBundleGroup ? 100 : 80}
                    keyExtractor={(p: any) => p.id}
                    renderItem={({ item }: { item: any }) => (
                      <ItemCard
                        name={item.name}
                        price={item.price}
                        qty={isBundleGroup ? undefined : item.qty}
                        inCart={cartMap[item.id]}
                        onPress={() => handleAdd({ ...item, isBundle: isBundleGroup })}
                        onAdd={() => {
                          if (!selectedCustomer) {
                            setToast('Please select a customer before adding items to cart');
                            return;
                          }
                          dispatch(addItem({ ...item, qty: 1 }));
                        }}
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
          <Cart 
            onCheckout={handleCheckout}
            loading={loadingInvoice}
          />
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

      <ApiTestModal
        visible={showApiTest}
        onDismiss={() => setShowApiTest(false)}
      />
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
});
