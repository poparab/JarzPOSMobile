import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { Customer, useLazyGetCityDetailsQuery } from '../api/customerApi';

interface CustomerDetailsProps {
  customer: Customer;
  onDeliveryDetails?: (details: {
    delivery_income: number;
    delivery_expense: number;
    customer_id: string;
    city_name: string;
  }) => void;
}

export function CustomerDetails({
  customer,
  onDeliveryDetails,
}: CustomerDetailsProps): React.ReactElement {
  const [cityName, setCityName] = useState<string>('');
  const [loadingCity, setLoadingCity] = useState(false);
  const [getCityDetails] = useLazyGetCityDetailsQuery();

  useEffect(() => {
    async function fetchCityDetails() {
      if (customer.city_id) {
        setLoadingCity(true);
        try {
          console.log(
            '🏙️ [CustomerDetails] Fetching city details for ID:',
            customer.city_id,
          );
          const cityDetails = await getCityDetails({
            city_id: customer.city_id,
          }).unwrap();
          setCityName(cityDetails.name);
          console.log('✅ [CustomerDetails] City resolved:', cityDetails.name);

          // Notify parent component about delivery details
          if (onDeliveryDetails) {
            onDeliveryDetails({
              delivery_income: customer.delivery_income || 0,
              delivery_expense: customer.delivery_expense || 0,
              customer_id: customer.name,
              city_name: cityDetails.name,
            });
          }
        } catch (error) {
          console.error(
            '❌ [CustomerDetails] Error fetching city details:',
            error,
          );
          setCityName('Unknown City');
        } finally {
          setLoadingCity(false);
        }
      } else {
        // No city_id, use territory as fallback
        setCityName(customer.territory || 'No City');
        if (onDeliveryDetails) {
          onDeliveryDetails({
            delivery_income: customer.delivery_income || 0,
            delivery_expense: customer.delivery_expense || 0,
            customer_id: customer.name,
            city_name: customer.territory || 'No City',
          });
        }
      }
    }

    fetchCityDetails();
  }, [customer, getCityDetails, onDeliveryDetails]);

  return (
    <Card style={styles.container} elevation={2}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.customerName}>
            {customer.customer_name}
          </Text>
          <Chip
            icon="account-check"
            style={styles.selectedChip}
            textStyle={styles.chipText}
          >
            Selected
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailsContainer}>
          {customer.mobile_no && (
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>
                📞 Phone:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {customer.mobile_no}
              </Text>
            </View>
          )}

          {customer.customer_primary_address && (
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>
                📍 Address:
              </Text>
              <Text variant="bodyMedium" style={styles.value} numberOfLines={2}>
                {customer.customer_primary_address}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={styles.label}>
              🏙️ City:
            </Text>
            {loadingCity ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Loading...
                </Text>
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.value}>
                {cityName}
              </Text>
            )}
          </View>

          {customer.delivery_income && customer.delivery_income > 0 && (
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>
                💰 Delivery Income:
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.value, styles.priceText]}
              >
                ${customer.delivery_income.toFixed(2)}
              </Text>
            </View>
          )}

          {customer.delivery_expense && customer.delivery_expense > 0 && (
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>
                🚚 Delivery Expense:
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.value, styles.expenseText]}
              >
                ${customer.delivery_expense.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#e8f5e8',
  },
  chipText: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 8,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '600',
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  value: {
    flex: 2,
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 12,
  },
  priceText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  expenseText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
});
