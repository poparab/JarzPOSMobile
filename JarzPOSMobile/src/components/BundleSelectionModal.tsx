import React, { useState, useMemo } from 'react';
import {
  Modal,
  Portal,
  Card,
  Title,
  Button,
  List,
  Text,
  IconButton,
} from 'react-native-paper';
import { Bundle, Product } from '../api/posApi';
import { View, StyleSheet, ScrollView } from 'react-native';

interface BundleSelectionModalProps {
  bundle: Bundle;
  onClose: () => void;
  onSelect: (bundle: Bundle, selectedItems: Product[]) => void;
}

export function BundleSelectionModal({
  bundle,
  onClose,
  onSelect,
}: BundleSelectionModalProps) {
  const [selections, setSelections] = useState<
    Record<string, Record<string, number>>
  >({});

  const groupTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const groupName in selections) {
      totals[groupName] = Object.values(selections[groupName]).reduce(
        (sum, qty) => sum + qty,
        0,
      );
    }
    return totals;
  }, [selections]);

  const handleQuantityChange = (
    groupName: string,
    item: Product,
    delta: 1 | -1,
  ) => {
    const group = bundle.item_groups.find((g) => g.group_name === groupName);
    if (!group) return;

    const currentGroupSelections = selections[groupName] || {};
    const currentItemQty = currentGroupSelections[item.id] || 0;
    const currentGroupTotal = groupTotals[groupName] || 0;

    if (delta === 1 && currentGroupTotal >= group.quantity) {
      return;
    }

    if (delta === -1 && currentItemQty === 0) {
      return;
    }

    const newItemQty = currentItemQty + delta;

    setSelections((prev) => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [item.id]: newItemQty,
      },
    }));
  };

  const isSelectionComplete = useMemo(() => {
    return bundle.item_groups.every((group) => {
      const total = groupTotals[group.group_name] || 0;
      return total === group.quantity;
    });
  }, [bundle.item_groups, groupTotals]);

  const handleConfirm = () => {
    if (isSelectionComplete) {
      const allSelected: Product[] = [];
      bundle.item_groups.forEach((group) => {
        const groupSelections = selections[group.group_name] || {};
        group.items.forEach((item) => {
          const qty = groupSelections[item.id];
          if (qty > 0) {
            for (let i = 0; i < qty; i++) {
              allSelected.push(item);
            }
          }
        });
      });
      onSelect(bundle, allSelected);
    }
  };

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={onClose}
        contentContainerStyle={styles.modal}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>{bundle.name}</Title>
            <ScrollView>
              {bundle.item_groups.map((group) => (
                <View key={group.group_name} style={styles.groupContainer}>
                  <Text style={styles.groupTitle}>
                    {`Select ${group.quantity} from ${group.group_name} (${groupTotals[group.group_name] || 0}/${group.quantity})`}
                  </Text>
                  {group.items.map((item) => {
                    const selectedQty =
                      selections[group.group_name]?.[item.id] || 0;
                    return (
                      <List.Item
                        key={item.id}
                        title={`${item.name} - $${item.price.toFixed(2)}`}
                        right={() => (
                          <View style={styles.quantityControl}>
                            <IconButton
                              icon="minus-circle"
                              size={24}
                              onPress={() =>
                                handleQuantityChange(group.group_name, item, -1)
                              }
                              disabled={selectedQty === 0}
                            />
                            <Text style={styles.quantityText}>
                              {selectedQty}
                            </Text>
                            <IconButton
                              icon="plus-circle"
                              size={24}
                              onPress={() =>
                                handleQuantityChange(group.group_name, item, 1)
                              }
                              disabled={
                                (groupTotals[group.group_name] || 0) >=
                                group.quantity
                              }
                            />
                          </View>
                        )}
                      />
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button onPress={onClose}>Cancel</Button>
            <Button onPress={handleConfirm} disabled={!isSelectionComplete}>
              Confirm
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  actions: {
    justifyContent: 'flex-end',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
});
