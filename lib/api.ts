// 📁 lib/api.ts

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

// Warn loudly in development if the key is missing — catches misconfigured
// env files before the error surfaces as a cryptic 401 from the server.
if (process.env.NODE_ENV === "development" && !API_KEY) {
  console.error(
    "[api] NEXT_PUBLIC_API_KEY is not set. " +
      "All requests will be rejected with 401. " +
      "Add it to .env.local and restart the dev server.",
  );
}

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL) {
  console.error(
    "[api] NEXT_PUBLIC_API_URL is not set. " +
      "All requests will time out. " +
      "Set it in your production environment variables.",
  );
}

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
  timeout: 10_000,
});

// ---------------------------------------------------------------------------
// 401 refresh interceptor
// ---------------------------------------------------------------------------

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function drainQueue(error: unknown, token?: string) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
}

/** Returns true when the 401 is an API key rejection rather than an expired JWT.
 *  We must NOT attempt a token refresh for these — the API key is baked into
 *  the axios instance and refreshing the JWT won't fix a missing/invalid key. */
function isApiKeyError(error: AxiosError<ApiErrorResponse>): boolean {
  const message = error.response?.data?.message?.toLowerCase() ?? "";
  return message.includes("api key");
}

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  // Handles both relative URLs ("/auth/login") and absolute URLs.
  const path = url.split("?")[0];
  return path.includes("/auth/");
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError<ApiErrorResponse>) => {
    // Preserve canceled requests so callers can ignore unmount/navigation aborts.
    if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      // 401 on auth endpoints (e.g., wrong login password) should surface
      // directly instead of triggering refresh and masking the real message.
      !isAuthEndpoint(originalRequest.url) &&
      // FIX: never try to refresh when the server is rejecting the API key —
      // that's a configuration error, not an expired token.
      !isApiKeyError(error)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        drainQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        drainQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred";
    const statusCode = error.response?.status ?? 0;
    const errors = error.response?.data?.errors;

    return Promise.reject(new ApiError(message, statusCode, errors));
  },
);

// ---------------------------------------------------------------------------
// Typed convenience wrappers
// ---------------------------------------------------------------------------

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

export default api;
