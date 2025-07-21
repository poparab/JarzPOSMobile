import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';

export interface Customer {
  name: string;
  customer_name: string;
  mobile_no?: string;
  customer_primary_address?: string;
  customer_primary_contact?: string;
  territory?: string;
  customer_group?: string;
  city_id?: string;
  delivery_income?: number;
  delivery_expense?: number;
}

export interface City {
  name: string;
  city_name: string;
  state?: string;
  country?: string;
  city_id?: string;
}

export interface CityDetails {
  id: string;
  name: string;
  state?: string;
  country?: string;
}

export interface InvoiceSubmission {
  customer_id: string;
  city_name: string;
  delivery_income: number;
  delivery_expense: number;
  cart_items: any[];
}

export interface CreateCustomerRequest {
  customer_name: string;
  mobile_no: string;
  customer_primary_address: string;
  territory: string;
}

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], { search?: string }>({
      query: ({ search = '' }) => {
        console.log('🔍 [CustomerAPI] Fetching customers with search:', search);
        if (search) {
          // Check if search looks like a phone number (contains only digits and common phone chars)
          const isPhoneSearch = /^[\d\s+\-()]+$/.test(search.trim());

          if (isPhoneSearch) {
            // Search only by phone/mobile for phone-like queries
            return {
              url: '/api/resource/Customer',
              method: 'GET',
              params: {
                fields:
                  '["name","customer_name","mobile_no","customer_primary_address","customer_primary_contact","territory","customer_group"]',
                filters: `[["mobile_no","like","%${search}%"]]`,
                limit_page_length: 20,
              },
            };
          } else {
            // Search only by name for text queries
            return {
              url: '/api/resource/Customer',
              method: 'GET',
              params: {
                fields:
                  '["name","customer_name","mobile_no","customer_primary_address","customer_primary_contact","territory","customer_group"]',
                filters: `[["customer_name","like","%${search}%"]]`,
                limit_page_length: 20,
              },
            };
          }
        } else {
          return {
            url: '/api/resource/Customer',
            method: 'GET',
            params: {
              fields:
                '["name","customer_name","mobile_no","customer_primary_address","customer_primary_contact","territory","customer_group"]',
              limit_page_length: 50,
            },
          };
        }
      },
      transformResponse: (response: { data: Customer[] }) => {
        console.log('✅ [CustomerAPI] Customers response:', response);
        console.log(
          '📊 [CustomerAPI] Number of customers returned:',
          response.data?.length || 0,
        );
        return response.data || [];
      },
      transformErrorResponse: (error) => {
        console.error('❌ [CustomerAPI] Error fetching customers:', error);
        return error;
      },
      providesTags: ['Customer'],
    }),
    searchCustomersByName: builder.query<Customer[], { name: string }>({
      query: ({ name }) => {
        console.log('🔍 [CustomerAPI] Searching customers by name:', name);
        return {
          url: '/api/resource/Customer',
          method: 'GET',
          params: {
            fields:
              '["name","customer_name","mobile_no","customer_primary_address","customer_primary_contact","territory","customer_group"]',
            filters: `[["customer_name","like","%${name}%"]]`,
            limit_page_length: 20,
          },
        };
      },
      transformResponse: (response: { data: Customer[] }) => {
        console.log('✅ [CustomerAPI] Name search response:', response);
        console.log(
          '📊 [CustomerAPI] Number of customers found:',
          response.data?.length || 0,
        );
        return response.data || [];
      },
      transformErrorResponse: (error) => {
        console.error('❌ [CustomerAPI] Error searching by name:', error);
        return error;
      },
    }),
    searchCustomersByPhone: builder.query<Customer[], { phone: string }>({
      query: ({ phone }) => {
        console.log('📞 [CustomerAPI] Searching customers by phone:', phone);
        return {
          url: '/api/resource/Customer',
          method: 'GET',
          params: {
            fields:
              '["name","customer_name","mobile_no","customer_primary_address","customer_primary_contact","territory","customer_group"]',
            filters: `[["mobile_no","like","%${phone}%"]]`,
            limit_page_length: 20,
          },
        };
      },
      transformResponse: (response: { data: Customer[] }) => {
        console.log('✅ [CustomerAPI] Phone search response:', response);
        console.log(
          '📊 [CustomerAPI] Number of customers found:',
          response.data?.length || 0,
        );
        return response.data || [];
      },
      transformErrorResponse: (error) => {
        console.error('❌ [CustomerAPI] Error searching by phone:', error);
        return error;
      },
    }),
    getCities: builder.query<City[], { search?: string }>({
      query: ({ search = '' }) => {
        console.log('🏙️ [CustomerAPI] Fetching cities with search:', search);
        return {
          url: '/api/method/jarz_pos.api.customer.get_cities',
          method: 'GET',
          params: search ? { search } : {},
        };
      },
      transformResponse: (response: { message: City[] }) => {
        console.log('✅ [CustomerAPI] Cities response:', response);
        console.log(
          '📊 [CustomerAPI] Number of cities returned:',
          response.message?.length || 0,
        );
        return response.message;
      },
      transformErrorResponse: (error) => {
        console.error('❌ [CustomerAPI] Error fetching cities:', error);
        return error;
      },
    }),
    createCustomer: builder.mutation<Customer, CreateCustomerRequest>({
      query: (customerData) => {
        console.log(
          '👤 [CustomerAPI] Creating customer with data:',
          customerData,
        );
        return {
          url: '/api/method/jarz_pos.api.customer.create_customer',
          method: 'POST',
          body: customerData,
        };
      },
      transformResponse: (response: { message: Customer }) => {
        console.log(
          '✅ [CustomerAPI] Customer created successfully:',
          response,
        );
        return response.message;
      },
      transformErrorResponse: (error) => {
        console.error('❌ [CustomerAPI] Error creating customer:', error);
        return error;
      },
      invalidatesTags: ['Customer'],
    }),
    getCityDetails: builder.query<CityDetails, { city_id: string }>({
      query: ({ city_id }) => {
        console.log('🏙️ [CustomerAPI] Fetching city details for ID:', city_id);
        return {
          url: '/api/method/custom_app.get_city',
          method: 'GET',
          params: { city_id },
        };
      },
      transformResponse: (response: { message: CityDetails }) => {
        console.log('✅ [CustomerAPI] City details response:', response);
        return response.message;
      },
      transformErrorResponse: (error) => {
        console.error('❌ [CustomerAPI] Error fetching city details:', error);
        return error;
      },
    }),
    submitInvoice: builder.mutation<any, InvoiceSubmission>({
      query: (invoiceData) => {
        console.log(
          '📄 [CustomerAPI] Submitting invoice with data:',
          invoiceData,
        );
        return {
          url: '/api/method/custom_app.submit_invoice',
          method: 'POST',
          body: invoiceData,
        };
      },
      transformResponse: (response: { message: any }) => {
        console.log(
          '✅ [CustomerAPI] Invoice submitted successfully:',
          response,
        );
        return response.message;
      },
      transformErrorResponse: (error) => {
        console.error('❌ [CustomerAPI] Error submitting invoice:', error);
        return error;
      },
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useSearchCustomersByNameQuery,
  useLazySearchCustomersByNameQuery,
  useSearchCustomersByPhoneQuery,
  useLazySearchCustomersByPhoneQuery,
  useGetCitiesQuery,
  useLazyGetCitiesQuery,
  useCreateCustomerMutation,
  useGetCityDetailsQuery,
  useLazyGetCityDetailsQuery,
  useSubmitInvoiceMutation,
} = customerApi;
