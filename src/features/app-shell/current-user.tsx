"use client";

import { createContext, useContext } from "react";

import type { UserOut } from "@/lib/api-types";

const CurrentUserContext = createContext<UserOut | null>(null);

export const CurrentUserProvider = CurrentUserContext.Provider;

/**
 * The signed-in account, for pages inside the app shell. Null while the shell is still
 * loading it: pages render straight away and fill in the account when it arrives.
 */
export function useCurrentUser(): UserOut | null {
  return useContext(CurrentUserContext);
}
