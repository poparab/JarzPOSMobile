import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  Searchbar,
  Card,
  Button,
  Portal,
  Modal,
  TextInput,
  HelperText,
  ActivityIndicator,
  Chip,
  Divider,
  IconButton,
  List,
} from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedCustomer } from '../store/customerSlice';
import {
  Customer,
  City,
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useLazySearchCustomersByNameQuery,
  useLazySearchCustomersByPhoneQuery,
  useGetCitiesQuery,
  useLazyGetCitiesQuery,
  useCreateCustomerMutation,
  CreateCustomerRequest,
} from '../api/customerApi';
import { useCustomerCache } from '../hooks/useCustomerCache';
import { highlightText, debounce } from '../utils/textUtils';

interface CustomerSelectorProps {
  onCustomerSelect?: (customer: Customer) => void;
}

interface QuickAddForm {
  customer_name: string;
  mobile_no: string;
  customer_primary_address: string;
  territory: string;
}

interface FormErrors {
  customer_name?: string;
  mobile_no?: string;
  customer_primary_address?: string;
  territory?: string;
}

export function CustomerSelector({ onCustomerSelect }: CustomerSelectorProps) {
  const dispatch = useAppDispatch();
  const selectedCustomer = useAppSelector((state) => state.customer.selectedCustomer);
  
  // Custom cache hook
  const {
    updateCustomerCache,
    getCachedSearch,
    cacheSearchResult,
    fuzzySearchCache,
    getRecentCustomers,
    markCustomerUsed,
  } = useCustomerCache();
  
  // Enhanced search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastSearchType, setLastSearchType] = useState<'name' | 'phone' | null>(null);
  const [hasFocus, setHasFocus] = useState(false);
  
  // Quick add modal state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState<QuickAddForm>({
    customer_name: '',
    mobile_no: '',
    customer_primary_address: '',
    territory: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // City search for dropdown
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  // Refs
  const searchRef = useRef<any>(null);
  
  // Enhanced API hooks
  const [searchByName, { isFetching: fetchingByName }] = useLazySearchCustomersByNameQuery();
  const [searchByPhone, { isFetching: fetchingByPhone }] = useLazySearchCustomersByPhoneQuery();
  const [searchCities, { data: cities = [], isFetching: searchingCities }] = useLazyGetCitiesQuery();
  const [createCustomer, { isLoading: creatingCustomer }] = useCreateCustomerMutation();
  
  // Load recent customers on mount
  useEffect(() => {
    setRecentCustomers(getRecentCustomers(5));
  }, [getRecentCustomers]);
  
  // Utility functions
  const isPhoneNumber = (input: string): boolean => {
    return /^[\d\s+\-()]+$/.test(input.trim());
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      console.log('🔍 [CustomerSelector] Performing search for:', query);
      setSearchLoading(true);

      try {
        // Check cache first
        const cachedResult = getCachedSearch(query);
        if (cachedResult) {
          console.log('⚡ [CustomerSelector] Using cached result');
          setSearchResults(cachedResult);
          setSearchLoading(false);
          return;
        }

        // Perform fuzzy search on cache
        const isPhone = isPhoneNumber(query);
        const cacheResults = fuzzySearchCache(query, isPhone);
        
        // If we have good cache results, show them while fetching fresh data
        if (cacheResults.length > 0) {
          setSearchResults(cacheResults);
        }

        // Fetch fresh data from API
        let apiResults: Customer[] = [];
        if (isPhone) {
          console.log('📞 [CustomerSelector] Searching by phone:', query);
          setLastSearchType('phone');
          apiResults = await searchByPhone({ phone: query }).unwrap();
        } else {
          console.log('👤 [CustomerSelector] Searching by name:', query);
          setLastSearchType('name');
          apiResults = await searchByName({ name: query }).unwrap();
        }

        // Merge cache and API results, prioritizing API results
        const mergedResults = [...apiResults];
        cacheResults.forEach(cacheResult => {
          if (!apiResults.find(api => api.name === cacheResult.name)) {
            mergedResults.push(cacheResult);
          }
        });

        setSearchResults(mergedResults);
        
        // Update cache with fresh results
        updateCustomerCache(apiResults);
        cacheSearchResult(query, mergedResults);
        
        console.log('✅ [CustomerSelector] Search completed, results:', mergedResults.length);
      } catch (error) {
        console.error('❌ [CustomerSelector] Search error:', error);
        // Fall back to cache results if API fails
        const cacheResults = fuzzySearchCache(query, isPhoneNumber(query));
        setSearchResults(cacheResults);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    [searchByName, searchByPhone, getCachedSearch, cacheSearchResult, fuzzySearchCache, updateCustomerCache]
  );

  // Handle search input changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    
    if (query.trim()) {
      debouncedSearch(query);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      if (hasFocus) {
        setShowDropdown(true); // Show recent customers when empty but focused
      }
    }
  };

  // Format customer display text
  const formatCustomerDisplay = (customer: Customer): string => {
    const name = customer.customer_name || 'Unknown';
    const phone = customer.mobile_no || 'No phone';
    const city = customer.territory || 'Unknown city';
    return `${name} — ${phone} — ${city}`;
  };

  // Highlight matching text in display
  const getHighlightedText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const highlighted = highlightText(text, query);
    const parts = highlighted.split(/<mark>|<\/mark>/);
    
    return parts.map((part, index) => (
      index % 2 === 1 ? (
        <Text key={index} style={styles.highlightedText}>{part}</Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    ));
  };

  // Search cities for quick add form
  useEffect(() => {
    if (citySearch.length >= 2) {
      console.log('🏙️ [CustomerSelector] Searching cities with query:', citySearch);
      searchCities({ search: citySearch });
    }
  }, [citySearch, searchCities]);

  // Keyboard navigation handlers
  const handleKeyDown = (key: string) => {
    if (!showDropdown) return;
    
    const totalItems = recentCustomers.length + searchResults.length;
    if (totalItems === 0) return;

    switch (key) {
      case 'ArrowDown':
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          const allCustomers = [...recentCustomers, ...searchResults];
          if (selectedIndex < allCustomers.length) {
            handleCustomerSelect(allCustomers[selectedIndex]);
          }
        } else if (searchResults.length === 0 && !searchQuery.trim()) {
          handleQuickAddOpen();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    console.log('👤 [CustomerSelector] Customer selected:', customer);
    dispatch(setSelectedCustomer(customer));
    setSearchQuery(customer.customer_name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSearchResults([]);
    setHasFocus(false);
    
    // Mark customer as used in cache
    markCustomerUsed(customer);
    
    onCustomerSelect?.(customer);
  };
  
  const handleSearchFocus = () => {
    setHasFocus(true);
    setShowDropdown(true);
    
    // Show recent customers when focused and no search query
    if (!searchQuery.trim()) {
      setRecentCustomers(getRecentCustomers(5));
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding dropdown to allow for clicks
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
    // Pre-fill form with search query if it looks like a name
    if (!isPhoneNumber(searchQuery)) {
      setQuickAddForm(prev => ({
        ...prev,
        customer_name: searchQuery
      }));
    } else {
      setQuickAddForm(prev => ({
        ...prev,
        mobile_no: searchQuery
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!quickAddForm.customer_name.trim()) {
      errors.customer_name = 'Customer name is required';
    }
    
    if (!quickAddForm.mobile_no.trim()) {
      errors.mobile_no = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(quickAddForm.mobile_no)) {
      errors.mobile_no = 'Please enter a valid phone number';
    }
    
    if (!quickAddForm.customer_primary_address.trim()) {
      errors.customer_primary_address = 'Address is required';
    }
    
    if (!quickAddForm.territory.trim()) {
      errors.territory = 'City is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleQuickAddSubmit = async () => {
    if (!validateForm()) return;
    
    console.log('➕ [CustomerSelector] Submitting quick add form:', quickAddForm);
    
    try {
      const newCustomer = await createCustomer(quickAddForm).unwrap();
      console.log('✅ [CustomerSelector] Customer created successfully:', newCustomer);
      
      // Update cache with new customer
      updateCustomerCache([newCustomer]);
      
      handleCustomerSelect(newCustomer);
      setShowQuickAdd(false);
      setQuickAddForm({
        customer_name: '',
        mobile_no: '',
        customer_primary_address: '',
        territory: '',
      });
      setFormErrors({});
    } catch (error) {
      console.error('❌ [CustomerSelector] Failed to create customer:', error);
    }
  };
  
  const handleCitySelect = (city: City) => {
    setQuickAddForm(prev => ({ ...prev, territory: city.name }));
    setCitySearch(city.city_name);
    setShowCityDropdown(false);
  };
  
  const clearCustomer = () => {
    dispatch(setSelectedCustomer(null));
    setSearchQuery('');
  };
  
  const renderCustomerItem = ({ item, index }: { item: Customer; index: number }) => {
    const isSelected = selectedIndex === index;
    const displayText = formatCustomerDisplay(item);
    
    return (
      <TouchableOpacity
        style={[styles.customerItem, isSelected && styles.customerItemSelected]}
        onPress={() => handleCustomerSelect(item)}
        accessible={true}
        accessibilityLabel={`Select customer ${item.customer_name}`}
        accessibilityRole="button"
      >
        <View style={styles.customerInfo}>
          {getHighlightedText(displayText, searchQuery)}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderCityItem = ({ item }: { item: City }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => handleCitySelect(item)}
      accessible={true}
      accessibilityLabel={`Select city ${item.city_name}`}
      accessibilityRole="button"
    >
      <Text style={styles.cityName}>{item.city_name}</Text>
      {item.state && <Text style={styles.cityState}>{item.state}</Text>}
    </TouchableOpacity>
  );

  // Memoized combined customer list for performance
  const combinedCustomers = useMemo(() => {
    const customers = [];
    
    // Add recent customers if no search query and has focus
    if (!searchQuery.trim() && hasFocus && recentCustomers.length > 0) {
      customers.push(...recentCustomers);
    }
    
    // Add search results
    if (searchResults.length > 0) {
      customers.push(...searchResults);
    }
    
    return customers;
  }, [searchQuery, hasFocus, recentCustomers, searchResults]);
  
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
          <View style={styles.searchContainer}>
            <Searchbar
              ref={searchRef}
              placeholder="Search customers by name or phone..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              style={styles.searchbar}
              icon="account-search"
              loading={searchLoading || fetchingByName || fetchingByPhone}
              accessible={true}
              accessibilityLabel="Search customers by name or phone number"
              accessibilityHint="Type to search for existing customers or create new one"
              onKeyPress={({ nativeEvent }) => handleKeyDown(nativeEvent.key)}
            />
            {searchQuery.length > 0 && (
              <IconButton
                icon="close"
                size={20}
                style={styles.clearButton}
                onPress={handleClearSearch}
                accessible={true}
                accessibilityLabel="Clear search"
              />
            )}
          </View>
          
          {showDropdown && (
            <Card style={styles.dropdown} elevation={4}>
              {searchLoading || fetchingByName || fetchingByPhone ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.loadingText}>
                    Searching customers...
                  </Text>
                </View>
              ) : combinedCustomers.length > 0 ? (
                <ScrollView 
                  style={styles.customerList}
                  keyboardShouldPersistTaps="handled"
                  accessible={true}
                  accessibilityLabel="Customer search results"
                >
                  {!searchQuery.trim() && hasFocus && recentCustomers.length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recently Added</Text>
                      </View>
                      {recentCustomers.map((customer, index) => 
                        renderCustomerItem({ item: customer, index })
                      )}
                      {searchResults.length > 0 && <Divider style={styles.sectionDivider} />}
                    </>
                  )}
                  
                  {searchResults.length > 0 && (
                    <>
                      {!searchQuery.trim() || (
                        <View style={styles.sectionHeader}>
                          <Text style={styles.sectionTitle}>
                            Search Results ({searchResults.length})
                          </Text>
                        </View>
                      )}
                      {searchResults.map((customer, index) => 
                        renderCustomerItem({ 
                          item: customer, 
                          index: recentCustomers.length + index 
                        })
                      )}
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
                      onPress={handleQuickAddOpen}
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
          )}
        </View>
      )}

      {/* Quick Add Customer Modal */}
      <Portal>
        <Modal
          visible={showQuickAdd}
          onDismiss={() => setShowQuickAdd(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.quickAddModal}
          >
            <Text style={styles.modalTitle}>Add New Customer</Text>
            
            <TextInput
              label="Customer Name *"
              value={quickAddForm.customer_name}
              onChangeText={(text) => setQuickAddForm(prev => ({ ...prev, customer_name: text }))}
              style={styles.formInput}
              error={!!formErrors.customer_name}
              accessible={true}
              accessibilityLabel="Customer name"
            />
            <HelperText type="error" visible={!!formErrors.customer_name}>
              {formErrors.customer_name}
            </HelperText>

            <TextInput
              label="Phone Number *"
              value={quickAddForm.mobile_no}
              onChangeText={(text) => setQuickAddForm(prev => ({ ...prev, mobile_no: text }))}
              keyboardType="phone-pad"
              style={styles.formInput}
              error={!!formErrors.mobile_no}
              accessible={true}
              accessibilityLabel="Phone number"
            />
            <HelperText type="error" visible={!!formErrors.mobile_no}>
              {formErrors.mobile_no}
            </HelperText>

            <TextInput
              label="Address *"
              value={quickAddForm.customer_primary_address}
              onChangeText={(text) => setQuickAddForm(prev => ({ ...prev, customer_primary_address: text }))}
              multiline
              numberOfLines={2}
              style={styles.formInput}
              error={!!formErrors.customer_primary_address}
              accessible={true}
              accessibilityLabel="Customer address"
            />
            <HelperText type="error" visible={!!formErrors.customer_primary_address}>
              {formErrors.customer_primary_address}
            </HelperText>

            <View style={styles.cityInputContainer}>
              <TextInput
                label="City *"
                value={citySearch}
                onChangeText={setCitySearch}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
                style={styles.formInput}
                error={!!formErrors.territory}
                accessible={true}
                accessibilityLabel="City"
              />
              
              {showCityDropdown && cities.length > 0 && (
                <Card style={styles.cityDropdown} elevation={4}>
                  <FlatList
                    data={cities}
                    renderItem={renderCityItem}
                    keyExtractor={(item) => item.name}
                    style={styles.cityList}
                    keyboardShouldPersistTaps="handled"
                  />
                </Card>
              )}
            </View>
            <HelperText type="error" visible={!!formErrors.territory}>
              {formErrors.territory}
            </HelperText>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowQuickAdd(false)}
                style={styles.modalButton}
                accessible={true}
                accessibilityLabel="Cancel"
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleQuickAddSubmit}
                loading={creatingCustomer}
                disabled={creatingCustomer}
                style={styles.modalButton}
                accessible={true}
                accessibilityLabel="Create customer"
              >
                Create
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
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
  searchContainer: {
    position: 'relative',
  },
  searchbar: {
    marginBottom: 8,
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'transparent',
  },
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
  modalContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  quickAddModal: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formInput: {
    marginBottom: 8,
  },
  cityInputContainer: {
    position: 'relative',
  },
  cityDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 150,
    zIndex: 1000,
  },
  cityList: {
    maxHeight: 140,
  },
  cityItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
  },
  cityState: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
