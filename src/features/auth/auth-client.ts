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

/** End the session and clear its cookies. */
export function logOut(): Promise<void> {
  return apiFetch<void>(API_PATHS.AUTH_LOGOUT, { method: "POST" });
}
