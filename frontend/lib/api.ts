import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

/** Shared Axios instance with base config */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor — attach auth token if present
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('finstar_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — normalise errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { detail?: string; message?: string })?.detail ??
      (error.response?.data as { detail?: string; message?: string })?.message ??
      error.message ??
      'An unexpected error occurred'

    return Promise.reject(new Error(message))
  }
)

/** Generic GET helper */
export async function get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(path, config)
  return response.data
}

/** Generic POST helper */
export async function post<T, D = unknown>(
  path: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(path, data, config)
  return response.data
}

/** Generic PUT helper */
export async function put<T, D = unknown>(
  path: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(path, data, config)
  return response.data
}

/** Generic PATCH helper */
export async function patch<T, D = unknown>(
  path: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<T>(path, data, config)
  return response.data
}

/** Generic DELETE helper */
export async function del<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(path, config)
  return response.data
}
