import { API_PATHS } from "@/lib/constants";
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
// /api against, so it calls the backend directly, without the session: only
// public routes (like /health) are called from the server.
function baseUrl(): string {
  return typeof window === "undefined" ? env.apiUrl : "/api";
}

const AUTH_PATH_PREFIX = "/auth/";

// One refresh at a time: when several calls get 401 together, they all wait for it.
let refreshInFlight: Promise<boolean> | null = null;

/** Swap the refresh cookie for a new session. Resolves to whether it worked. */
function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch(`${baseUrl()}${API_PATHS.AUTH_REFRESH}`, {
    method: "POST",
    credentials: "include",
  })
    .then(
      (response) => response.ok,
      () => false,
    )
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
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

  const send = async (): Promise<Response> => {
    try {
      return await fetch(`${baseUrl()}${path}`, {
        ...rest,
        headers: requestHeaders,
        body: requestBody,
        credentials: "include",
      });
    } catch {
      // fetch only rejects on network failures.
      throw new ApiError(NETWORK_ERROR_MESSAGE, 0, "network_error", null);
    }
  };

  const isAuthCall = path.startsWith(AUTH_PATH_PREFIX);
  let response = await send();
  // The access cookie lasts an hour. When it has run out, refresh once and retry,
  // so people stay logged in while they work. Auth calls report their own 401s.
  if (response.status === 401 && !isAuthCall && typeof window !== "undefined" && (await refreshSession())) {
    response = await send();
  }

  if (!response.ok) {
    throw await toApiError(response, isAuthCall);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function toApiError(response: Response, isAuthCall: boolean): Promise<ApiError> {
  const backendError = await readBackendError(response);
  const code = backendError?.code ?? `http_${response.status}`;
  const requestId = backendError?.request_id ?? response.headers.get("X-Request-ID");

  return new ApiError(
    friendlyMessage(response.status, backendError?.message, isAuthCall),
    response.status,
    code,
    requestId,
  );
}

function friendlyMessage(status: number, backendMessage: string | undefined, isAuthCall: boolean): string {
  switch (status) {
    case 401:
      // On log-in the backend says what went wrong ("Wrong email or password").
      return isAuthCall ? (backendMessage ?? UNAUTHORIZED_MESSAGE) : UNAUTHORIZED_MESSAGE;
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
