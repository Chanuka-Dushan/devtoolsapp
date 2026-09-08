/**
 * User Saved/Favorited Tools Store (localStorage with server sync capability)
 */

const FAVORITES_KEY = "devtools_favorite_tools";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ["json-formatter", "base64", "code-explainer"];
  } catch {
    return ["json-formatter", "base64", "code-explainer"];
  }
}

export function toggleFavorite(slug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getFavorites();
    let updated: string[];
    let isFav = false;
    if (current.includes(slug)) {
      updated = current.filter((s) => s !== slug);
    } else {
      updated = [...current, slug];
      isFav = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("favorites-changed"));
    return isFav;
  } catch {
    return false;
  }
}

export function isFavorite(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return getFavorites().includes(slug);
}
