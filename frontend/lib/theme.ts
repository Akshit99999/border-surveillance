export type ConsoleTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "borderlens.console.theme";

export function getStoredTheme(): ConsoleTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  // Preserve the existing light blue tactical theme until the operator
  // explicitly chooses dark mode.
  return "light";
}

export function applyTheme(theme: ConsoleTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent("borderlens-theme-change", { detail: theme }));
}
