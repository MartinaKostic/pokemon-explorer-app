import { useState, useEffect, useCallback } from "react";
import type { PokemonFilters, SortOption } from "../types/pokemon";
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  filtersToURLParams,
  urlParamsToFilters,
  hasActiveFilters,
} from "../utils/filters";

export function useFiltersAndSort() {
  const [filters, setFilters] = useState<PokemonFilters>(() => {
    // Initialize from URL on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return urlParamsToFilters(params);
    }
    return DEFAULT_FILTERS;
  });

  const [appliedFilters, setAppliedFilters] = useState<PokemonFilters>(filters);
  const [isFilteringEnabled, setIsFilteringEnabled] = useState(() => {
    // Enable filtering if we have active filters from URL on initial load
    return hasActiveFilters(filters);
  });

  const [sortOption, setSortOption] = useState<SortOption>(() => {
    // Initialize sort from URL on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sortField = params.get("sortBy");
      const sortDirection = params.get("sortDir");

      if (
        sortField &&
        (sortField === "none" ||
          sortField === "name" ||
          sortField === "totalPower" ||
          sortField === "generation" ||
          sortField === "attack" ||
          sortField === "defense" ||
          sortField === "speed")
      ) {
        return {
          field: sortField,
          direction: sortDirection === "desc" ? "desc" : "asc",
        };
      }
    }
    return DEFAULT_SORT;
  });

  // Update URL when applied filters or sort change
  useEffect(() => {
    const current = new URLSearchParams(window.location.search);

    const filterKeys = [
      "types",
      "typeMatchMode",
      "generations",
      // stat params
      "hp_min",
      "hp_max",
      "attack_min",
      "attack_max",
      "defense_min",
      "defense_max",
      "speed_min",
      "speed_max",
      "abilities",
      // sort params
      "sortBy",
      "sortDir",
    ];
    filterKeys.forEach((k) => current.delete(k));

    const nextFilterParams = filtersToURLParams(appliedFilters);
    nextFilterParams.forEach((value, key) => {
      current.set(key, value);
    });

    if (sortOption.field !== "none") {
      current.set("sortBy", sortOption.field);
      current.set("sortDir", sortOption.direction);
    }

    const newQuery = current.toString();
    const newUrl = newQuery
      ? `${window.location.pathname}?${newQuery}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }, [appliedFilters, sortOption]);

  const updateFilters = useCallback((newFilters: PokemonFilters) => {
    setFilters(newFilters);
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setIsFilteringEnabled(true);
  }, [filters]);

  const updateSort = useCallback((newSort: SortOption) => {
    setSortOption(newSort);
  }, []);

  const applyFiltersNow = useCallback((next: PokemonFilters) => {
    setFilters(next);
    setAppliedFilters(next);
    setIsFilteringEnabled(true);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setIsFilteringEnabled(false);
  }, []);

  const resetSort = useCallback(() => {
    setSortOption(DEFAULT_SORT);
  }, []);

  return {
    filters,
    appliedFilters,
    sortOption,
    isFilteringEnabled,
    updateFilters,
    applyFilters,
    updateSort,
    applyFiltersNow,
    clearFilters,
    resetSort,
    hasActiveFilters: hasActiveFilters(filters),
    hasAppliedFilters: hasActiveFilters(appliedFilters),
  };
}
