import { env } from "@/lib/env";

/** Every backend error response has this shape (see app/core/middleware.py). */
interface BackendErrorBody {
  error: {
    code: string;
    message: string;
    request_id: string | null;
  };
}

/** Error thrown by apiFetch for any failed backend call. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly requestId: string | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequestInit extends Omit<RequestInit, "body" | "credentials"> {
  /** A plain object is sent as JSON. FormData is sent as-is (for file uploads). */
  body?: unknown;
}

const NETWORK_ERROR_MESSAGE = "Can't reach the server. Check your connection and try again.";
const UNAUTHORIZED_MESSAGE = "Your session has expired. Please sign in again.";
const FORBIDDEN_FALLBACK_MESSAGE = "You don't have access to this yet.";
const RATE_LIMITED_MESSAGE = "Too many requests. Please wait a moment and try again.";

// In the browser, call the same-origin /api rewrite so the backend's httpOnly
// session cookies are sent automatically. Server code has no origin to resolve
// /api against, so it calls the backend directly.
// TODO(akashshetty1997): forward the session cookie on server-side calls (#3).
function baseUrl(): string {
  return typeof window === "undefined" ? env.apiUrl : "/api";
}

/**
 * Call the backend API. Use this for every backend request instead of fetch.
 * Throws ApiError with a user-friendly message when the request fails.
 */
export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { body, headers, ...rest } = init;
  const requestHeaders = new Headers(headers);

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: requestBody,
      credentials: "include",
    });
  } catch {
    // fetch only rejects on network failures.
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, "network_error", null);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  const backendError = await readBackendError(response);
  const code = backendError?.code ?? `http_${response.status}`;
  const requestId = backendError?.request_id ?? response.headers.get("X-Request-ID");

  return new ApiError(
    friendlyMessage(response.status, backendError?.message),
    response.status,
    code,
    requestId,
  );
}

function friendlyMessage(status: number, backendMessage: string | undefined): string {
  switch (status) {
    case 401:
      return UNAUTHORIZED_MESSAGE;
    case 403:
      // The backend explains what is locked, e.g. "Save your attempt first".
      return backendMessage ?? FORBIDDEN_FALLBACK_MESSAGE;
    case 429:
      return RATE_LIMITED_MESSAGE;
    default:
      return backendMessage ?? `Something went wrong (error ${status}). Please try again.`;
  }
}

async function readBackendError(response: Response): Promise<BackendErrorBody["error"] | null> {
  try {
    const data: unknown = await response.json();
    return isBackendErrorBody(data) ? data.error : null;
  } catch {
    return null;
  }
}

function isBackendErrorBody(data: unknown): data is BackendErrorBody {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return false;
  }
  const { error } = data;
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}
