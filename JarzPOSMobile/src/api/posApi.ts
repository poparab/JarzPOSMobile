import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { AxiosResponse } from 'axios';

export interface Product {
  id: string;
  name: string;
  price: number;
  item_group: string;
  qty?: number;
}

export interface BundleItemGroup {
  group_name: string;
  quantity: number;
  items: Product[];
}

export interface Bundle {
  id: string;
  name: string;
  price: number;
  item_groups: BundleItemGroup[];
}

export interface Invoice {
  name: string;
  status: string;
  amount: number;
  items: number;
  courier?: string;
}

export interface PosProfile {
  name: string;
}

export interface RawBundle {
  name: string;
  bundle_name?: string;
  bundle_price?: number;
  items?: string[];
}

export const posApi = createApi({
  reducerPath: 'posApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product', 'Bundle', 'Invoice'],
  endpoints: (builder) => ({
    getPosProfiles: builder.query<PosProfile[], void>({
      query: () => ({ url: '/api/method/jarz_pos.api.pos.get_pos_profiles' }),
      transformResponse: (res: { message: unknown }) => {
        // Frappe can return either list[str] or list[object]
        const msg = (res as any).message;
        if (Array.isArray(msg)) {
          if (msg.length > 0 && typeof msg[0] === 'string') {
            return msg.map((n: string) => ({ name: n }));
          }
          return msg as PosProfile[];
        }
        return [];
      },
    }),
    getProductsByProfile: builder.query<Product[], string>({
      query: (profile) => ({
        url: `/api/method/jarz_pos.api.pos.get_profile_products?profile=${encodeURIComponent(profile)}`,
      }),
      transformResponse: (res: { message: Product[] }) => res.message,
      providesTags: ['Product'],
    }),
    getBundlesByProfile: builder.query<Bundle[], string>({
      query: (profile) => ({
        url: `/api/method/jarz_pos.api.pos.get_profile_bundles?profile=${encodeURIComponent(profile)}`,
      }),
      transformResponse: (res: { message: Bundle[] }) =>
        res.message.map((b: Bundle) => ({
          id: b.id,
          name: b.name,
          price: b.price,
          item_groups: b.item_groups ?? [],
        })),
      providesTags: ['Bundle'],
    }),
    getProducts: builder.query<Product[], void>({
      query: () => ({ url: '/products' }),
      providesTags: ['Product'],
    }),
    getBundles: builder.query<Bundle[], void>({
      query: () => ({ url: '/bundles' }),
      providesTags: ['Bundle'],
    }),
    createInvoice: builder.mutation<
      AxiosResponse<{ name: string }>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: '/create_sales_invoice',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Invoice'],
    }),
    getInvoices: builder.query<Invoice[], void>({
      query: () => ({ url: '/invoices' }),
      transformResponse: (res: { message?: Invoice[] }) => res.message ?? [],
      providesTags: ['Invoice'],
    }),
    updateInvoiceStatus: builder.mutation<
      { ok: boolean },
      { name: string; status: string }
    >({
      query: (body) => ({ url: '/invoice_status', method: 'POST', data: body }),
      invalidatesTags: ['Invoice'],
    }),
  }),
});

export const {
  useGetPosProfilesQuery,
  useGetProductsByProfileQuery,
  useGetBundlesByProfileQuery,
  useGetProductsQuery,
  useGetBundlesQuery,
  useCreateInvoiceMutation,
  useGetInvoicesQuery,
  useUpdateInvoiceStatusMutation,
} = posApi; 
