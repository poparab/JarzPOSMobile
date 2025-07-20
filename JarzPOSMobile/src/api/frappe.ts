import { axiosInstance } from './axiosInstance';
import type { AxiosResponse } from 'axios';

export async function callFrappe<T = unknown>(
  methodPath: string,
  params?: Record<string, unknown>,
): Promise<AxiosResponse<T>> {
  return axiosInstance.post<T>(`/api/method/${methodPath}`, params);
}
