import { createContext } from "react";
import { FAVORITES_STORAGE_KEY } from "../constants";

export type FavoritesContextValue = {
  favorites: Set<number>;
  isFavorite: (id: number) => boolean;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (id: number) => void;
  clearFavorites: () => void;
};

export const FavoritesContext = createContext<
  FavoritesContextValue | undefined
>(undefined);

export const STORAGE_KEY = FAVORITES_STORAGE_KEY;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
}
