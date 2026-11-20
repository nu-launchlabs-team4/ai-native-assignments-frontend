import { THEME_STORAGE_KEY } from "@/lib/constants";

// Kept apart from theme.ts, which uses React hooks, so the root layout (a Server Component) can import it.

/**
 * Runs in <head> before the page paints, so a saved dark choice applies with no flash.
 * Light is the default when nothing is saved.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`;
