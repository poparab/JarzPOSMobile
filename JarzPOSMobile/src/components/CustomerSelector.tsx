import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedCustomer } from '../store/customerSlice';
import {
  Customer,
  useLazySearchCustomersByNameQuery,
  useLazySearchCustomersByPhoneQuery,
} from '../api/customerApi';
import { debounce } from '../utils/textUtils';
import { CustomerSearchInput } from './CustomerSearchInput';
import { CustomerDropdown } from './CustomerDropdown';
import { CustomerQuickAdd } from './CustomerQuickAdd';

interface CustomerSelectorProps {
  onCustomerSelect?: (customer: Customer) => void;
}

export function CustomerSelector({ onCustomerSelect }: CustomerSelectorProps) {
  const dispatch = useAppDispatch();
  const selectedCustomer = useAppSelector((state) => state.customer.selectedCustomer);
  
  // Simple state management
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasFocus, setHasFocus] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  const searchRef = useRef<any>(null);
  
  // API hooks
  const [searchByName] = useLazySearchCustomersByNameQuery();
  const [searchByPhone] = useLazySearchCustomersByPhoneQuery();
  
  // Utility function
  const isPhoneNumber = (input: string): boolean => {
    return /^[\d\s+\-()]+$/.test(input.trim());
  };

  // Simplified search function
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const isPhone = isPhoneNumber(query);
      let results: Customer[] = [];
      
      if (isPhone) {
        results = await searchByPhone({ phone: query }).unwrap();
      } else {
        results = await searchByName({ name: query }).unwrap();
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchByName, searchByPhone]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
    [performSearch]
  );

  // Event handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    
    if (query.trim()) {
      debouncedSearch(query);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      if (hasFocus) {
        setShowDropdown(true);
      }
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    dispatch(setSelectedCustomer(customer));
    setSearchQuery(customer.customer_name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSearchResults([]);
    setHasFocus(false);
    
    // Update recent customers
    setRecentCustomers(prev => {
      const filtered = prev.filter(c => c.name !== customer.name);
      return [customer, ...filtered].slice(0, 5);
    });
    
    onCustomerSelect?.(customer);
  };
  
  const handleSearchFocus = () => {
    setHasFocus(true);
    setShowDropdown(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
      setHasFocus(false);
    }, 150);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setHasFocus(false);
    searchRef.current?.blur();
  };

  const handleQuickAddOpen = () => {
    setShowQuickAdd(true);
    setShowDropdown(false);
  };

  const handleQuickAddSuccess = (customer: Customer) => {
    handleCustomerSelect(customer);
    setShowQuickAdd(false);
  };
  
  const clearCustomer = () => {
    dispatch(setSelectedCustomer(null));
    setSearchQuery('');
  };

  // Get initial form data for quick add
  const getInitialQuickAddForm = () => {
    if (!searchQuery.trim()) return {};
    
    if (isPhoneNumber(searchQuery)) {
      return { mobile_no: searchQuery };
    } else {
      return { customer_name: searchQuery };
    }
  };
  
  return (
    <View style={styles.container}>
      {selectedCustomer ? (
        <View style={styles.selectedCustomerContainer}>
          <Chip
            style={styles.selectedCustomerChip}
            onClose={clearCustomer}
            closeIcon="close"
            accessible={true}
            accessibilityLabel={`Selected customer: ${selectedCustomer.customer_name}`}
          >
            {selectedCustomer.customer_name}
          </Chip>
        </View>
      ) : (
        <View style={styles.selectorContainer}>
          <CustomerSearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onClear={handleClearSearch}
            loading={searchLoading}
            searchRef={searchRef}
          />
          
          <CustomerDropdown
            visible={showDropdown}
            loading={searchLoading}
            recentCustomers={recentCustomers}
            searchResults={searchResults}
            searchQuery={searchQuery}
            selectedIndex={selectedIndex}
            hasFocus={hasFocus}
            onCustomerSelect={handleCustomerSelect}
            onAddNewCustomer={handleQuickAddOpen}
          />
        </View>
      )}

      <CustomerQuickAdd
        visible={showQuickAdd}
        onDismiss={() => setShowQuickAdd(false)}
        onSuccess={handleQuickAddSuccess}
        initialForm={getInitialQuickAddForm()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selectedCustomerContainer: {
    marginBottom: 8,
  },
  selectedCustomerChip: {
    alignSelf: 'flex-start',
  },
  selectorContainer: {
    position: 'relative',
  },
});
