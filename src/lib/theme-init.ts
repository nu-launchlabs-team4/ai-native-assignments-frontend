import { DARK_SCHEME_QUERY, THEME_STORAGE_KEY } from "@/lib/constants";

// Kept apart from theme.ts, which uses React hooks, so the root layout (a Server Component) can import it.

const KEY = JSON.stringify(THEME_STORAGE_KEY);
const QUERY = JSON.stringify(DARK_SCHEME_QUERY);

/**
 * Runs in <head> before the page paints, so the right appearance shows with no flash.
 * With no saved choice (the "System" setting) it follows the device, including when the
 * device switches between light and dark while the page is open.
 */
export const THEME_INIT_SCRIPT = `try{var m=matchMedia(${QUERY}),r=document.documentElement,a=function(){var p=localStorage.getItem(${KEY});r.classList.toggle("dark",p==="dark"||(p!=="light"&&m.matches))};a();m.addEventListener("change",a)}catch(e){}`;
