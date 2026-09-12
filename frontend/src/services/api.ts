const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ApiRequestOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Base HTTP request utility.
 * Attaches Authorization header if token is provided or present in localStorage.
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, headers, ...restOptions } = options;

  const authToken = token || localStorage.getItem("token");

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    requestHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      ...requestHeaders,
      ...(headers as Record<string, string>),
    },
  });

  let responseData: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (responseData && typeof responseData === "object" && "message" in responseData)
        ? String((responseData as { message: unknown }).message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

export default api;
