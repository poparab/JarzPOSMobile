import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Customer } from '../api/customerApi';

interface CustomerListItemProps {
  customer: Customer;
  onSelect: (customer: Customer) => void;
  isSelected?: boolean;
  searchQuery?: string;
}

export function CustomerListItem({
  customer,
  onSelect,
  isSelected = false,
  searchQuery = '',
}: CustomerListItemProps) {
  const formatCustomerDisplay = (): string => {
    const name = customer.customer_name || 'Unknown';
    const phone = customer.mobile_no || 'No phone';
    const city = customer.territory || 'Unknown city';
    return `${name} — ${phone} — ${city}`;
  };

  const getHighlightedText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => (
        regex.test(part) ? (
          <Text key={index} style={styles.highlightedText}>{part}</Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      ));
    } catch {
      return text;
    }
  };

  const displayText = formatCustomerDisplay();

  return (
    <TouchableOpacity
      style={[styles.customerItem, isSelected && styles.customerItemSelected]}
      onPress={() => onSelect(customer)}
      accessible={true}
      accessibilityLabel={`Select customer ${customer.customer_name}`}
      accessibilityRole="button"
    >
      <View style={styles.customerInfo}>
        {getHighlightedText(displayText, searchQuery)}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  customerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  customerItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  customerInfo: {
    flex: 1,
  },
  highlightedText: {
    backgroundColor: '#ffeb3b',
    fontWeight: 'bold',
  },
});
