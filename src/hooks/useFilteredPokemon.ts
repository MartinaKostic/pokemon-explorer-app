import { useState, useEffect, useCallback } from "react";
import type {
  PokemonFilters,
  SortOption,
  PokemonWithDetails,
} from "../types/pokemon";
import { fetchFilteredAndSortedPokemon } from "../api/filteredPokemonApi";

export function useFilteredPokemon(
  filters: PokemonFilters,
  sortOption: SortOption,
  searchTerm: string,
  page: number = 1,
  pageSize: number = 30,
  shouldFetchData: boolean = true
) {
  const [pokemon, setPokemon] = useState<PokemonWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchPokemon = useCallback(async () => {
    if (!shouldFetchData) {
      setLoading(false);
      setPokemon([]);
      setTotalCount(0);
      setHasNextPage(false);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await fetchFilteredAndSortedPokemon(
        filters,
        sortOption,
        searchTerm,
        page,
        pageSize
      );

      setPokemon(results.pokemon);
      setTotalCount(results.totalCount);
      setHasNextPage(results.hasNextPage);

      setCurrentPage(results.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPokemon([]);
      setTotalCount(0);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [filters, sortOption, searchTerm, page, pageSize, shouldFetchData]);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  return {
    pokemon,
    totalCount,
    hasNextPage,
    currentPage,
    loading,
    error,
  };
}
