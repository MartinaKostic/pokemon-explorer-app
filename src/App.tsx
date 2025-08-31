import { useEffect, useState } from "react";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { PokemonGridChooser } from "./components/PokemonGridChooser";
import { PokemonFilters } from "./components/PokemonFilters";
import { SortControls } from "./components/SortControls";
import { PokemonModal } from "./components/PokemonModal";
import { PokemonLogo } from "./components/PokemonLogo";
import { useFiltersAndSort } from "./hooks/useFiltersAndSort";
import { X, Search } from "lucide-react";
import { useFavorites } from "./hooks/useFavorites";
import { NotFound } from "./components/NotFound";
import { SEARCH_DEBOUNCE_MS } from "./constants";

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
    applyFiltersNow,
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

  const { favorites } = useFavorites();
  const favoriteIds = favorites;
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const favoritesCount = favoriteIds.size;

  useEffect(() => {
    if (favoritesCount === 0 && showFavoritesOnly) setShowFavoritesOnly(false);
  }, [favoritesCount, showFavoritesOnly]);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) params.set("q", searchTerm);
    else params.delete("q");
    const newQuery = params.toString();
    const newUrl = newQuery
      ? `${window.location.pathname}?${newQuery}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [searchTerm]);

  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  const path = window.location.pathname;
  const isKnownPath = path === "/" || path === "/index.html";

  const handlePokemonSelect = (id: number) => setSelectedPokemonId(id);
  const handleModalClose = () => setSelectedPokemonId(null);

  const handleLogoClick = () => {
    clearFilters();
    setSearchTerm("");
    window.history.pushState({}, "", "/");
  };

  return (
    <div className="min-h-dvh bg-blue-50 text-slate-900 font-sans">
      {!isKnownPath ? (
        <NotFound />
      ) : (
        <>
          <header className="bg-blue-50/80 backdrop-blur">
            <div className="container mx-auto px-4 py-3 font-semibold">
              <div className="flex items-center justify-between gap-3">
                <PokemonLogo onClick={handleLogoClick} />
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 max-w-none xl:max-w-screen-2xl 2xl:px-16 3xl:px-24">
            <div className="mb-6">
              <div className="mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="w-full lg:flex-1 lg:max-w-md order-1">
                    <SearchInput
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                    />
                  </div>

                  <div className="flex gap-3 order-2">
                    <div className="flex-1 lg:flex-none">
                      <PokemonFilters
                        filters={filters}
                        onFiltersChange={updateFilters}
                        onApplyFilters={applyFilters}
                        onApplyFiltersNow={applyFiltersNow}
                        onClearFilters={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                      />
                    </div>
                    <div className="flex-1 lg:flex-none">
                      <SortControls
                        sortOption={sortOption}
                        onSortChange={updateSort}
                      />
                    </div>
                    <div className="flex-1 lg:flex-none">
                      <FavoritesToggle
                        active={showFavoritesOnly}
                        count={favoritesCount}
                        onToggle={() => setShowFavoritesOnly((v) => !v)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {(hasAppliedFilters || searchTerm) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-sm px-2 py-1 rounded-full">
                      Search: "{searchTerm}"
                      <button
                        aria-label="Clear search"
                        className="ml-1"
                        onClick={() => setSearchTerm("")}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  <AppliedChips
                    appliedFilters={appliedFilters}
                    onRemoveType={(t) =>
                      applyFiltersNow({
                        ...appliedFilters,
                        types: appliedFilters.types.filter((x) => x !== t),
                      })
                    }
                    onRemoveGen={(g) =>
                      applyFiltersNow({
                        ...appliedFilters,
                        generations: appliedFilters.generations.filter(
                          (x) => x !== g
                        ),
                      })
                    }
                    onResetStat={(stat) =>
                      applyFiltersNow({
                        ...appliedFilters,
                        stats: {
                          ...appliedFilters.stats,
                          [stat]: [1, 255],
                        },
                      })
                    }
                    onRemoveAbility={(a) =>
                      applyFiltersNow({
                        ...appliedFilters,
                        abilities: appliedFilters.abilities.filter(
                          (x) => x !== a
                        ),
                      })
                    }
                  />
                </div>
              )}
            </div>

            {showFavoritesOnly ? (
              <PokemonGridChooser
                filters={appliedFilters}
                sortOption={sortOption}
                searchTerm={debouncedSearch}
                isFilteringEnabled={true}
                onSortChange={updateSort}
                onClearFilters={clearFilters}
                onPokemonSelect={handlePokemonSelect}
                includeIds={favoriteIds}
              />
            ) : (
              <PokemonGridChooser
                filters={appliedFilters}
                sortOption={sortOption}
                searchTerm={debouncedSearch}
                isFilteringEnabled={isFilteringEnabled}
                onSortChange={updateSort}
                onClearFilters={clearFilters}
                onPokemonSelect={handlePokemonSelect}
              />
            )}
          </main>

          <PokemonModal
            pokemonId={selectedPokemonId}
            onClose={handleModalClose}
          />
        </>
      )}
    </div>
  );
}

export default App;

function SearchInput({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (search: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search
        size={16}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        placeholder="Search Pokémon..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`w-full pl-10 pr-3 py-2 lg:py-2.5 text-sm lg:text-base border rounded-lg brand-focus h-10 lg:h-11 ${
          searchTerm ? "border-[var(--brand)] bg-blue-50" : "border-slate-300"
        }`}
      />
    </div>
  );
}

function FavoritesToggle({
  active,
  count,
  onToggle,
}: {
  active: boolean;
  count: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="btn w-full justify-center"
      aria-pressed={active}
      aria-label={active ? "Showing favorites only" : "Show favorites only"}
      title={active ? "Showing favorites" : "Show favorites"}
      onClick={onToggle}
      disabled={count === 0}
      style={
        active
          ? {
              backgroundColor: "#fffbea",
              borderColor: "var(--accent)",
              color: "var(--accent)",
            }
          : undefined
      }
    >
      <span>Favorites</span>
      <span
        className={`inline-flex items-center justify-center h-5 min-w-5 rounded-full text-xs px-1 ${count > 0 ? "bg-[var(--accent)] text-white" : "bg-slate-200 text-slate-600"}`}
      >
        {count}
      </span>
    </button>
  );
}

function AppliedChips({
  appliedFilters,
  onRemoveType,
  onRemoveGen,
  onResetStat,
  onRemoveAbility,
}: {
  appliedFilters: ReturnType<typeof useFiltersAndSort>["appliedFilters"];
  onRemoveType: (t: string) => void;
  onRemoveGen: (g: number) => void;
  onResetStat: (stat: string) => void;
  onRemoveAbility: (a: string) => void;
}) {
  return (
    <>
      {appliedFilters.types.map((t) => (
        <span
          key={`type-${t}`}
          className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 text-sm px-2 py-1 rounded-full capitalize"
        >
          Type: {t}
          <button
            aria-label={`Remove type ${t}`}
            className="ml-1 hover:text-slate-900"
            onClick={() => onRemoveType(t)}
          >
            <X size={14} />
          </button>
        </span>
      ))}

      {appliedFilters.generations.map((g) => (
        <span
          key={`gen-${g}`}
          className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 text-sm px-2 py-1 rounded-full"
        >
          Gen {g}
          <button
            aria-label={`Remove generation ${g}`}
            className="ml-1 hover:text-slate-900"
            onClick={() => onRemoveGen(g)}
          >
            <X size={14} />
          </button>
        </span>
      ))}

      {Object.entries(appliedFilters.stats)
        .filter(([, [min, max]]) => min !== 1 || max !== 255)
        .map(([stat]) => (
          <span
            key={`stat-${stat}`}
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 text-sm px-2 py-1 rounded-full capitalize"
          >
            {stat}
            <button
              aria-label={`Reset ${stat}`}
              className="ml-1 hover:text-slate-900"
              onClick={() => onResetStat(stat)}
            >
              <X size={14} />
            </button>
          </span>
        ))}

      {appliedFilters.abilities.map((a) => (
        <span
          key={`ab-${a}`}
          className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 text-sm px-2 py-1 rounded-full capitalize"
        >
          Ability: {a.replace("-", " ")}
          <button
            aria-label={`Remove ability ${a}`}
            className="ml-1 hover:text-slate-900"
            onClick={() => onRemoveAbility(a)}
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </>
  );
}
