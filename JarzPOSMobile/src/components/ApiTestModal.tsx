import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Card,
  ActivityIndicator,
  Portal,
  Modal,
} from 'react-native-paper';
import {
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetCitiesQuery,
  useLazyGetCitiesQuery,
  useCreateCustomerMutation,
} from '../api/customerApi';

interface ApiTestModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function ApiTestModal({ visible, onDismiss }: ApiTestModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  // API hooks
  const [
    searchCustomers,
    { data: customers, isFetching: fetchingCustomers, error: customerError },
  ] = useLazyGetCustomersQuery();
  const [
    searchCities,
    { data: cities, isFetching: fetchingCities, error: cityError },
  ] = useLazyGetCitiesQuery();
  const [createCustomer, { isLoading: creatingCustomer, error: createError }] =
    useCreateCustomerMutation();

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [`[${timestamp}] ${result}`, ...prev.slice(0, 9)]);
  };

  const testGetCustomers = async () => {
    console.log('🧪 [ApiTest] Testing get customers API...');
    addTestResult('Testing get customers API...');

    try {
      const result = await searchCustomers({ search: searchTerm }).unwrap();
      console.log('✅ [ApiTest] Get customers success:', result);
      addTestResult(
        `✅ Get customers success: ${result.length} customers found`,
      );
    } catch (error) {
      console.error('❌ [ApiTest] Get customers error:', error);
      addTestResult(`❌ Get customers error: ${JSON.stringify(error)}`);
    }
  };

  const testGetCities = async () => {
    console.log('🧪 [ApiTest] Testing get cities API...');
    addTestResult('Testing get cities API...');

    try {
      const result = await searchCities({ search: citySearchTerm }).unwrap();
      console.log('✅ [ApiTest] Get cities success:', result);
      addTestResult(`✅ Get cities success: ${result.length} cities found`);
    } catch (error) {
      console.error('❌ [ApiTest] Get cities error:', error);
      addTestResult(`❌ Get cities error: ${JSON.stringify(error)}`);
    }
  };

  const testCreateCustomer = async () => {
    console.log('🧪 [ApiTest] Testing create customer API...');
    addTestResult('Testing create customer API...');

    const testCustomer = {
      customer_name: `Test Customer ${Date.now()}`,
      mobile_no: '+1234567890',
      customer_primary_address: '123 Test Street, Test City',
      territory: 'Test City',
    };

    try {
      const result = await createCustomer(testCustomer).unwrap();
      console.log('✅ [ApiTest] Create customer success:', result);
      addTestResult(
        `✅ Create customer success: ${result.name || result.customer_name}`,
      );
    } catch (error) {
      console.error('❌ [ApiTest] Create customer error:', error);
      addTestResult(`❌ Create customer error: ${JSON.stringify(error)}`);
    }
  };

  const testAllAPIs = async () => {
    addTestResult('🚀 Starting comprehensive API test...');
    await testGetCustomers();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    await testGetCities();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    await testCreateCustomer();
    addTestResult('🏁 API test completed');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Customer API Test Panel</Text>

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>1. Test Get Customers</Text>
            <TextInput
              label="Search customers"
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={testGetCustomers}
              loading={fetchingCustomers}
              style={styles.button}
            >
              Test Get Customers
            </Button>
            {customers && (
              <Text style={styles.result}>
                Found {customers.length} customers
              </Text>
            )}
            {customerError && (
              <Text style={styles.error}>Error: {String(customerError)}</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>2. Test Get Cities</Text>
            <TextInput
              label="Search cities"
              value={citySearchTerm}
              onChangeText={setCitySearchTerm}
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={testGetCities}
              loading={fetchingCities}
              style={styles.button}
            >
              Test Get Cities
            </Button>
            {cities && (
              <Text style={styles.result}>Found {cities.length} cities</Text>
            )}
            {cityError && (
              <Text style={styles.error}>Error: {String(cityError)}</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>3. Test Create Customer</Text>
            <Button
              mode="contained"
              onPress={testCreateCustomer}
              loading={creatingCustomer}
              style={styles.button}
            >
              Test Create Customer
            </Button>
            {createError && (
              <Text style={styles.error}>Error: {String(createError)}</Text>
            )}
          </Card.Content>
        </Card>

        <Button mode="outlined" onPress={testAllAPIs} style={styles.button}>
          🚀 Test All APIs
        </Button>

        <Card style={styles.resultsSection}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Test Results Log</Text>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.logEntry}>
                {result}
              </Text>
            ))}
          </Card.Content>
        </Card>

        <Button onPress={onDismiss} style={styles.closeButton}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginBottom: 8,
  },
  result: {
    color: 'green',
    marginTop: 4,
  },
  error: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  resultsSection: {
    marginTop: 16,
    maxHeight: 200,
  },
  logEntry: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  closeButton: {
    marginTop: 16,
  },
});
