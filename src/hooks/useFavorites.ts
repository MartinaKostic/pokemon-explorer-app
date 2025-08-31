import { useContext } from "react";
import {
  FavoritesContext,
  type FavoritesContextValue,
} from "../utils/favorites";

const defaultValue: FavoritesContextValue = {
  favorites: new Set<number>(),
  isFavorite: () => false,
  addFavorite: () => {},
  removeFavorite: () => {},
  toggleFavorite: () => {},
  clearFavorites: () => {},
};

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  return ctx ?? defaultValue;
}

export default useFavorites;
