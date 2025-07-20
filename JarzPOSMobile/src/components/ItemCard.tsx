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

export function ItemCard({ name, price = 0, inCart = 0, qty, onPress, onAdd, onRemove }: ItemCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        {typeof qty === 'number' && <Text style={styles.stock}>In stock: {qty}</Text>}
      </Card.Content>
      {inCart > 0 ? (
        <View style={styles.quantityControl}>
          <IconButton icon="minus-circle" size={24} onPress={onRemove} />
          <Text style={styles.inCartText}>{inCart}</Text>
          <IconButton icon="plus-circle" size={24} onPress={onAdd} />
        </View>
      ) : (
        <IconButton icon="plus-circle-outline" size={24} onPress={onAdd} style={styles.addButton} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    flex: 1,
    minWidth: 150,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    marginBottom: 4,
  },
  stock: {
    fontSize: 12,
    color: '#888',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  inCartText: {
    fontSize: 18,
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    alignSelf: 'center',
  },
});
