import React from 'react';
import { Card, Text, Badge, IconButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface ItemCardProps {
  name: string;
  price?: number;
  inCart?: number;
  qty?: number;
  onPress: () => void;
  onAdd: () => void;
  onRemove: () => void;
}

export function ItemCard({
  name,
  price = 0,
  inCart = 0,
  qty,
  onPress,
  onAdd,
  onRemove,
}: ItemCardProps) {
  const getStockColor = () => {
    if (typeof qty !== 'number') return '#888';
    if (qty === 0) return '#ff4444'; // Red
    if (qty < 20) return '#ffaa00'; // Yellow/Orange
    return '#00aa00'; // Green
  };

  const getCardStyle = () => {
    if (typeof qty === 'number' && qty === 0) {
      return [styles.card, styles.outOfStock];
    }
    return styles.card;
  };

  const isOutOfStock = typeof qty === 'number' && qty === 0;

  return (
    <Card style={getCardStyle()} onPress={onPress}>
      <Card.Content style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        {typeof qty === 'number' && (
          <Text style={[styles.stock, { color: getStockColor() }]}>
            Stock: {qty}
          </Text>
        )}
      </Card.Content>
      {!isOutOfStock && inCart > 0 ? (
        <View style={styles.quantityControl}>
          <IconButton
            icon="minus-circle"
            size={20}
            onPress={onRemove}
            style={styles.controlButton}
          />
          <Text style={styles.inCartText}>{inCart}</Text>
          <IconButton
            icon="plus-circle"
            size={20}
            onPress={onAdd}
            style={styles.controlButton}
          />
        </View>
      ) : isOutOfStock ? (
        <Text style={styles.outOfStockText}>Out of Stock</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 2,
    flex: 1,
    minWidth: 80,
    maxWidth: 150,
    minHeight: 90,
  },
  outOfStock: {
    opacity: 0.6,
    backgroundColor: '#ffebee',
  },
  content: {
    paddingBottom: 2,
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 14,
  },
  price: {
    marginBottom: 2,
    fontSize: 14,
    fontWeight: '600',
  },
  stock: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  controlButton: {
    margin: 0,
  },
  inCartText: {
    fontSize: 14,
    marginHorizontal: 4,
    minWidth: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  outOfStockText: {
    fontSize: 12,
    color: '#ff4444',
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: 8,
  },
});
