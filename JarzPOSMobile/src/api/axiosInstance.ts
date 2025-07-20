import axios from 'axios';
import { API_BASE_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { AUTH_METHOD } from '@env';
import type { AxiosRequestConfig } from 'axios';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

// request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    if (AUTH_METHOD === 'apikey') {
      (config as AxiosRequestConfig).headers = {
        ...(config.headers as any),
        Authorization: `token ${token}`,
      } as any;
    } else {
      (config as AxiosRequestConfig).headers = {
        ...(config.headers as any),
        Cookie: `sid=${token}`,
      } as any;
      config.withCredentials = true;
    }
  }
  return config;
});

// response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      await SecureStore.deleteItemAsync('authToken');
      // optionally dispatch logout or navigate
    }
    return Promise.reject(error);
  },
);
