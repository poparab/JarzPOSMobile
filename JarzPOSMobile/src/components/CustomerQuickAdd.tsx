import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import {
  Portal,
  Modal,
  Text,
  TextInput,
  HelperText,
  Button,
  Card,
} from 'react-native-paper';
import { 
  Customer,
  City, 
  useLazyGetCitiesQuery, 
  useCreateCustomerMutation,
  CreateCustomerRequest 
} from '../api/customerApi';

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

interface CustomerQuickAddProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: (customer: Customer) => void;
  initialForm?: Partial<QuickAddForm>;
}

export function CustomerQuickAdd({
  visible,
  onDismiss,
  onSuccess,
  initialForm = {},
}: CustomerQuickAddProps) {
  const [form, setForm] = useState<QuickAddForm>({
    customer_name: '',
    mobile_no: '',
    customer_primary_address: '',
    territory: '',
    ...initialForm,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const [searchCities, { data: cities = [] }] = useLazyGetCitiesQuery();
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setForm({
        customer_name: '',
        mobile_no: '',
        customer_primary_address: '',
        territory: '',
        ...initialForm,
      });
      setErrors({});
      setCitySearch('');
    }
  }, [visible, initialForm]);

  // Search cities
  useEffect(() => {
    if (citySearch.length >= 2) {
      searchCities({ search: citySearch });
    }
  }, [citySearch, searchCities]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }
    
    if (!form.mobile_no.trim()) {
      newErrors.mobile_no = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(form.mobile_no)) {
      newErrors.mobile_no = 'Please enter a valid phone number';
    }
    
    if (!form.customer_primary_address.trim()) {
      newErrors.customer_primary_address = 'Address is required';
    }
    
    if (!form.territory.trim()) {
      newErrors.territory = 'City is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const result = await createCustomer(form).unwrap();
      onSuccess(result);
      onDismiss();
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const handleCitySelect = (city: City) => {
    setForm(prev => ({ ...prev, territory: city.name }));
    setCitySearch(city.city_name);
    setShowCityDropdown(false);
  };

  const renderCityItem = ({ item }: { item: City }) => (
    <Button
      mode="text"
      onPress={() => handleCitySelect(item)}
      style={styles.cityItem}
      contentStyle={styles.cityItemContent}
      accessible={true}
      accessibilityLabel={`Select city ${item.city_name}`}
    >
      <View>
        <Text style={styles.cityName}>{item.city_name}</Text>
        {item.state && <Text style={styles.cityState}>{item.state}</Text>}
      </View>
    </Button>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modal}
        >
          <Text style={styles.modalTitle}>Add New Customer</Text>
          
          <TextInput
            label="Customer Name *"
            value={form.customer_name}
            onChangeText={(text) => setForm(prev => ({ ...prev, customer_name: text }))}
            style={styles.input}
            error={!!errors.customer_name}
            accessible={true}
            accessibilityLabel="Customer name"
          />
          <HelperText type="error" visible={!!errors.customer_name}>
            {errors.customer_name}
          </HelperText>

          <TextInput
            label="Phone Number *"
            value={form.mobile_no}
            onChangeText={(text) => setForm(prev => ({ ...prev, mobile_no: text }))}
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors.mobile_no}
            accessible={true}
            accessibilityLabel="Phone number"
          />
          <HelperText type="error" visible={!!errors.mobile_no}>
            {errors.mobile_no}
          </HelperText>

          <TextInput
            label="Address *"
            value={form.customer_primary_address}
            onChangeText={(text) => setForm(prev => ({ ...prev, customer_primary_address: text }))}
            multiline
            numberOfLines={2}
            style={styles.input}
            error={!!errors.customer_primary_address}
            accessible={true}
            accessibilityLabel="Customer address"
          />
          <HelperText type="error" visible={!!errors.customer_primary_address}>
            {errors.customer_primary_address}
          </HelperText>

          <View style={styles.cityContainer}>
            <TextInput
              label="City *"
              value={citySearch}
              onChangeText={setCitySearch}
              onFocus={() => setShowCityDropdown(true)}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
              style={styles.input}
              error={!!errors.territory}
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
          <HelperText type="error" visible={!!errors.territory}>
            {errors.territory}
          </HelperText>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.button}
              accessible={true}
              accessibilityLabel="Cancel"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={creating}
              disabled={creating}
              style={styles.button}
              accessible={true}
              accessibilityLabel="Create customer"
            >
              Create
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modal: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  cityContainer: {
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
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cityItemContent: {
    justifyContent: 'flex-start',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
  },
  cityState: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'left',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
