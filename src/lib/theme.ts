import { STORAGE_KEY } from "@/lib/store/store";

/** Runs before first paint (inline in <head>) to apply the saved theme without a flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var t='system';var raw=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(raw){var s=JSON.parse(raw);if(s&&s.settings&&(s.settings.theme==='light'||s.settings.theme==='dark'))t=s.settings.theme;}var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}})();`;

export function resolveTheme(pref: "system" | "light" | "dark"): "light" | "dark" {
  if (pref !== "system") return pref;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
