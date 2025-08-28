import { useEffect, useState } from "react";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { PokemonGridChooser } from "./components/PokemonGridChooser";
import { PokemonFilters } from "./components/PokemonFilters";
import { SortControls } from "./components/SortControls";
import { PokemonModal } from "./components/PokemonModal";
import { useFiltersAndSort } from "./hooks/useFiltersAndSort";

function App() {
  const {
    filters,
    appliedFilters,
    sortOption,
    isFilteringEnabled,
    updateFilters,
    applyFilters,
    updateSort,
    clearFilters,
    hasActiveFilters,
    hasAppliedFilters,
  } = useFiltersAndSort();

  const [searchTerm, setSearchTerm] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    } catch {
      return "";
    }
  });

  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(
    null
  );

  const handlePokemonSelect = (id: number) => {
    setSelectedPokemonId(id);
  };

  const handleModalClose = () => {
    setSelectedPokemonId(null);
  };

  // Update URL when search changes (preserve existing non-search params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    const newQuery = params.toString();
    const newUrl = newQuery
      ? `${window.location.pathname}?${newQuery}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [searchTerm]);

  // Debounce search to avoid triggering network-heavy operations on every keystroke
  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-3 font-semibold">
          Pokémon Explorer
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-none xl:max-w-screen-2xl 2xl:px-16 3xl:px-24">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
            <div className="flex-1">
              <PokemonFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onApplyFilters={applyFilters}
                onClearFilters={clearFilters}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
            <SortControls sortOption={sortOption} onSortChange={updateSort} />
          </div>
          {(hasAppliedFilters || searchTerm) && (
            <div className="mt-4 text-sm text-slate-600 bg-blue-50 px-2 py-1 rounded">
              {searchTerm && `Searching for "${searchTerm}"`}
              {searchTerm && hasAppliedFilters && " • "}
              {appliedFilters.types.length > 0 &&
                `${appliedFilters.types.length} type${appliedFilters.types.length > 1 ? "s" : ""} (${appliedFilters.typeMatchMode})`}
              {appliedFilters.generations.length > 0 &&
                ` • Gen ${appliedFilters.generations.join(", ")}`}
              {Object.values(appliedFilters.stats).some(
                ([min, max]: [number, number]) => min !== 1 || max !== 255
              ) && " • Custom stats"}
              {appliedFilters.abilities.length > 0 &&
                ` • ${appliedFilters.abilities.length} abilit${appliedFilters.abilities.length > 1 ? "ies" : "y"}`}
            </div>
          )}
        </div>
        <PokemonGridChooser
          filters={appliedFilters}
          sortOption={sortOption}
          // Use raw searchTerm for routing (so UI switches immediately), but
          // pass the debounced one for actual data fetching/rendering downstream
          searchTerm={debouncedSearch}
          isFilteringEnabled={isFilteringEnabled}
          onSortChange={updateSort}
          onClearFilters={clearFilters}
          onPokemonSelect={handlePokemonSelect}
        />
      </main>

      <PokemonModal pokemonId={selectedPokemonId} onClose={handleModalClose} />
    </div>
  );
}

export default App;
