import { apiFetch } from "@/lib/api";
import type { SignupOut, UserOut } from "@/lib/api-types";
import { API_PATHS } from "@/lib/constants";

// The backend sets and clears the httpOnly session cookies. These calls never see a token.

/** Log in with email and password. */
export function logIn(email: string, password: string): Promise<UserOut> {
  return apiFetch<UserOut>(API_PATHS.AUTH_LOGIN, { method: "POST", body: { email, password } });
}

/** Create an account. `confirm_email` is true when the person must confirm their email first. */
export function signUp(email: string, password: string): Promise<SignupOut> {
  return apiFetch<SignupOut>(API_PATHS.AUTH_SIGNUP, { method: "POST", body: { email, password } });
}

/** The signed-in account. A 401 means the session is gone (after one refresh attempt). */
export function getMe(): Promise<UserOut> {
  return apiFetch<UserOut>(API_PATHS.AUTH_ME);
}

/** End the session and clear its cookies. */
export function logOut(): Promise<void> {
  return apiFetch<void>(API_PATHS.AUTH_LOGOUT, { method: "POST" });
}

/** Email a reset link. Succeeds whether or not the account exists. */
export function requestPasswordReset(email: string): Promise<void> {
  return apiFetch<void>(API_PATHS.AUTH_FORGOT_PASSWORD, { method: "POST", body: { email } });
}

/** Set a new password with the reset link's one-time code, which also logs in. */
export function resetPassword(tokenHash: string, password: string): Promise<UserOut> {
  return apiFetch<UserOut>(API_PATHS.AUTH_RESET_PASSWORD, {
    method: "POST",
    body: { token_hash: tokenHash, password },
  });
}
