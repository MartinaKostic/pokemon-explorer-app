import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FavoritesContext,
  STORAGE_KEY,
  readStorage,
  writeStorage,
} from "../utils/favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    const initial = readStorage<number[]>(STORAGE_KEY, []);
    return new Set(initial);
  });

  useEffect(() => {
    writeStorage(STORAGE_KEY, Array.from(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (id: number) => favorites.has(id),
    [favorites]
  );

  const addFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites(new Set()), []);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
    }),
    [
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesProvider;
