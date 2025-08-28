import { useIsMobile } from "../hooks/useIsMobile";
import { PokemonGridMobile } from "./PokemonGrid.mobile";
import { PokemonGridDesktop } from "./PokemonGrid.desktop";
import { PokemonGridWithFilters } from "./PokemonGridWithFilters";
import type { PokemonFilters, SortOption } from "../types/pokemon";
import { hasActiveFilterCriteria } from "../api/filteredPokemonApi";

type Props = {
  filters: PokemonFilters;
  sortOption: SortOption;
  searchTerm: string;
  isFilteringEnabled: boolean;
  onClearFilters: () => void; // Add callback for clear filters
  onSortChange?: (sortOption: SortOption) => void; // Add callback for sort changes
  onPokemonSelect?: (id: number) => void; // Add callback for pokemon selection
};

export function PokemonGridChooser({
  filters,
  sortOption,
  searchTerm,
  isFilteringEnabled,
  onClearFilters,
  onSortChange,
  onPokemonSelect,
}: Props) {
  const isMobile = useIsMobile();

  const useFilteredGrid =
    isFilteringEnabled && hasActiveFilterCriteria(filters);

  const hasCustomSort = sortOption.field !== "none";
  const hasSearch = searchTerm.trim() !== "";

  // Use the filtered grid if we have filters OR custom sorting OR search
  if (useFilteredGrid || hasCustomSort || hasSearch) {
    return (
      <PokemonGridWithFilters
        filters={filters}
        sortOption={sortOption}
        searchTerm={searchTerm}
        onClearFilters={onClearFilters}
        onSortChange={onSortChange}
        onPokemonSelect={onPokemonSelect}
      />
    );
  }

  // Use original pagination system when no filters and default sorting
  return isMobile ? (
    <PokemonGridMobile onPokemonSelect={onPokemonSelect} />
  ) : (
    <PokemonGridDesktop onPokemonSelect={onPokemonSelect} />
  );
}
