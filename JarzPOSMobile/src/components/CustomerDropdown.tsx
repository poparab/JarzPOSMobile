import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, ActivityIndicator, Text, Button, Divider } from 'react-native-paper';
import { Customer } from '../api/customerApi';
import { CustomerListItem } from './CustomerListItem';

interface CustomerDropdownProps {
  visible: boolean;
  loading: boolean;
  recentCustomers: Customer[];
  searchResults: Customer[];
  searchQuery: string;
  selectedIndex: number;
  hasFocus: boolean;
  onCustomerSelect: (customer: Customer) => void;
  onAddNewCustomer: () => void;
}

export function CustomerDropdown({
  visible,
  loading,
  recentCustomers,
  searchResults,
  searchQuery,
  selectedIndex,
  hasFocus,
  onCustomerSelect,
  onAddNewCustomer,
}: CustomerDropdownProps) {
  if (!visible) return null;

  const showRecentCustomers = !searchQuery.trim() && hasFocus && recentCustomers.length > 0;
  const hasSearchResults = searchResults.length > 0;
  const hasAnyResults = showRecentCustomers || hasSearchResults;

  return (
    <Card style={styles.dropdown} elevation={4}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Searching customers...</Text>
        </View>
      ) : hasAnyResults ? (
        <ScrollView 
          style={styles.customerList}
          keyboardShouldPersistTaps="handled"
          accessible={true}
          accessibilityLabel="Customer search results"
        >
          {showRecentCustomers && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recently Added</Text>
              </View>
              {recentCustomers.map((customer, index) => (
                <CustomerListItem
                  key={`recent-${customer.name}-${index}`}
                  customer={customer}
                  onSelect={onCustomerSelect}
                  isSelected={selectedIndex === index}
                  searchQuery={searchQuery}
                />
              ))}
              {hasSearchResults && <Divider style={styles.sectionDivider} />}
            </>
          )}
          
          {hasSearchResults && (
            <>
              {searchQuery.trim() && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Search Results ({searchResults.length})
                  </Text>
                </View>
              )}
              {searchResults.map((customer, index) => (
                <CustomerListItem
                  key={`search-${customer.name}-${index}`}
                  customer={customer}
                  onSelect={onCustomerSelect}
                  isSelected={selectedIndex === (recentCustomers.length + index)}
                  searchQuery={searchQuery}
                />
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            {searchQuery.trim() 
              ? `No customers found for "${searchQuery}"`
              : 'No recent customers'
            }
          </Text>
          {searchQuery.trim() && (
            <Button
              mode="contained"
              onPress={onAddNewCustomer}
              style={styles.quickAddButton}
              accessible={true}
              accessibilityLabel="Add new customer"
            >
              Add New Customer
            </Button>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 300,
    zIndex: 1000,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  customerList: {
    maxHeight: 280,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  sectionDivider: {
    marginVertical: 4,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  quickAddButton: {
    marginTop: 8,
  },
});
