/**
 * Typed API client wrapper
 * Uses fetch with proper error handling and type safety
 * 
 * NOTE: In production, use httpOnly cookies for JWT tokens instead of localStorage
 * This requires backend support for SameSite cookie attributes
 */

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Typed fetch wrapper with error handling
 */
export async function apiFetch<T>(
  path: string,
  opts?: RequestInit
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  // Get auth token from localStorage (replace with httpOnly cookie in production)
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts?.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    credentials: 'include', // Important for httpOnly cookies
    ...opts,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API ${response.status} ${response.statusText}`;
    let errors: Record<string, string[]> | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errors = errorData.errors;
    } catch {
      // If response is not JSON, use default error message
      const text = await response.text();
      if (text) errorMessage = text;
    }

    throw new ApiClientError(errorMessage, response.status, errors);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return (await response.json()) as T;
}

/**
 * GET request helper
 */
export function apiGet<T>(path: string, opts?: RequestInit): Promise<T> {
  return apiFetch<T>(path, { ...opts, method: 'GET' });
}

/**
 * POST request helper
 */
export function apiPost<T>(
  path: string,
  body?: unknown,
  opts?: RequestInit
): Promise<T> {
  return apiFetch<T>(path, {
    ...opts,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export function apiPut<T>(
  path: string,
  body?: unknown,
  opts?: RequestInit
): Promise<T> {
  return apiFetch<T>(path, {
    ...opts,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(path: string, opts?: RequestInit): Promise<T> {
  return apiFetch<T>(path, { ...opts, method: 'DELETE' });
}

