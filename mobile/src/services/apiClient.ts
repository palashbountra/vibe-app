/**
 * API client — thin wrapper around fetch.
 * Reads base URL from app config. Attaches Cognito JWT automatically.
 *
 * Usage:
 *   import { api } from '@/services/apiClient';
 *   const { data, error } = await api.get<User>('/users/me');
 */

import { useAuthStore } from '@/store/authStore';

// In dev this points to a mock; swap to real API Gateway URL in prod
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://mock.vibe.local/v1';

type ApiResponse<T> = { data: T | null; error: string | null };

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const token = useAuthStore.getState().accessToken;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const json = await res.json();

    if (!res.ok) {
      return { data: null, error: json.error ?? `HTTP ${res.status}` };
    }

    return { data: json.data ?? json, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export const api = {
  get:    <T>(path: string) => request<T>('GET', path),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
