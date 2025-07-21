import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  List,
  Divider,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeItem, updateQty } from '../store/cartSlice';
import { CartItem } from '../store/cartSlice';
import { computeCartTotals } from '../utils/cartTotals';

interface CartProps {
  onCheckout?: () => void;
  loading?: boolean;
}

interface CartItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQty,
}: CartItemCardProps): React.ReactElement {
  const total = item.price * item.qty;

  return (
    <Card style={styles.cartItem} elevation={1}>
      <List.Item
        title={item.name}
        description={
          item.isDeliveryItem
            ? 'Delivery charge'
            : `${item.qty} x $${item.price.toFixed(2)}`
        }
        left={(props) => (
          <List.Icon
            {...props}
            icon={
              item.isDeliveryItem
                ? 'truck-delivery'
                : item.isBundle
                  ? 'package-variant'
                  : 'package'
            }
          />
        )}
        right={() => (
          <View style={styles.cartItemRight}>
            <Text variant="titleMedium" style={styles.itemTotal}>
              ${total.toFixed(2)}
            </Text>
            {!item.isDeliveryItem && (
              <View style={styles.qtyControls}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() =>
                    item.qty > 1
                      ? onUpdateQty(item.id, item.qty - 1)
                      : onRemove(item.id)
                  }
                  style={styles.qtyButton}
                >
                  {item.qty > 1 ? '-' : '🗑️'}
                </Button>
                <Text style={styles.qtyText}>{item.qty}</Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => onUpdateQty(item.id, item.qty + 1)}
                  style={styles.qtyButton}
                >
                  +
                </Button>
              </View>
            )}
          </View>
        )}
      />
    </Card>
  );
}

export function Cart({
  onCheckout,
  loading = false,
}: CartProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const cartState = useAppSelector((state) => state.cart);
  const { items, delivery_expense } = cartState;

  const totals = computeCartTotals(items);

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleUpdateQty = (id: string, qty: number) => {
    dispatch(updateQty({ id, qty }));
  };

  const finalTotal = totals.grandTotal + delivery_expense;

  if (items.length === 0) {
    return (
      <Card style={styles.emptyCart} elevation={2}>
        <Card.Content>
          <View style={styles.emptyCartContent}>
            <Text variant="headlineSmall" style={styles.emptyCartText}>
              🛒 Cart is Empty
            </Text>
            <Text variant="bodyMedium" style={styles.emptyCartSubtext}>
              Add items to your cart to get started
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.cartCard} elevation={3}>
        <Card.Title
          title="Shopping Cart"
          subtitle={`${items.length} item${items.length > 1 ? 's' : ''}`}
          left={(props) => <List.Icon {...props} icon="cart" />}
        />
        <Card.Content>
          <View style={styles.cartItems}>
            <FlashList
              data={items}
              renderItem={({ item }) => (
                <CartItemCard
                  item={item}
                  onRemove={handleRemoveItem}
                  onUpdateQty={handleUpdateQty}
                />
              )}
              keyExtractor={(item) => item.id}
              estimatedItemSize={80}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Cart Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">Subtotal:</Text>
              <Text variant="bodyLarge">${totals.net.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Delivery Income:</Text>
              <Text variant="bodyMedium">
                ${totals.deliveryIncome.toFixed(2)}
              </Text>
            </View>

            {delivery_expense > 0 && (
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.deliveryExpenseLabel}>
                  🚚 Delivery Expense:
                </Text>
                <Text variant="bodyMedium" style={styles.deliveryExpenseValue}>
                  ${delivery_expense.toFixed(2)}
                </Text>
              </View>
            )}

            <Divider style={styles.totalDivider} />

            <View style={styles.summaryRow}>
              <Text variant="titleLarge" style={styles.totalLabel}>
                Total:
              </Text>
              <Text variant="titleLarge" style={styles.totalValue}>
                ${finalTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          {onCheckout && (
            <Button
              mode="contained"
              onPress={onCheckout}
              style={styles.checkoutButton}
              contentStyle={styles.checkoutButtonContent}
              loading={loading}
              disabled={loading || items.length === 0}
              icon="credit-card"
            >
              {loading
                ? 'Processing...'
                : `Checkout - $${finalTotal.toFixed(2)}`}
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyCart: {
    margin: 16,
  },
  emptyCartContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyCartText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartSubtext: {
    textAlign: 'center',
    color: '#666',
  },
  cartCard: {
    flex: 1,
  },
  cartItems: {
    maxHeight: 300,
    marginBottom: 16,
  },
  cartItem: {
    marginVertical: 4,
  },
  cartItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  itemTotal: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    minWidth: 40,
    height: 32,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  summary: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryExpenseLabel: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  deliveryExpenseValue: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  totalDivider: {
    marginVertical: 8,
    backgroundColor: '#ddd',
    height: 2,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  checkoutButton: {
    marginTop: 16,
  },
  checkoutButtonContent: {
    paddingVertical: 8,
  },
});
