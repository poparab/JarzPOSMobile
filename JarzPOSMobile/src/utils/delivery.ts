import { axiosInstance } from '../api/axiosInstance';

const cache = new Map<string, number>();

export async function resolveDeliveryExpense(cityId: string): Promise<number> {
  if (cache.has(cityId)) return cache.get(cityId)!;
  try {
    const { data } = await axiosInstance.get<{ cost: number }>(
      `/delivery/${cityId}`,
    );
    cache.set(cityId, data.cost);
    return data.cost;
  } catch {
    return 0;
  }
}
