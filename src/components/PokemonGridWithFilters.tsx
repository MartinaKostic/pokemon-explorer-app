import { useState, useEffect, useRef } from "react";
import type {
  PokemonFilters,
  SortOption,
  PokemonWithDetails,
} from "../types/pokemon";
import { DEFAULT_SORT } from "../utils/filters";
import { useFilteredPokemon } from "../hooks/useFilteredPokemon";
import { useIsMobile } from "../hooks/useIsMobile";
import { HeavyOperationDialog } from "./HeavyOperationDialog";
import PokemonCard from "./PokemonCard";
import { EmptyState } from "./EmptyState.tsx";

type Props = {
  filters: PokemonFilters;
  sortOption: SortOption;
  searchTerm: string;
  onClearFilters: () => void;
  onSortChange?: (sortOption: SortOption) => void;
  onPokemonSelect?: (id: number) => void;
  includeIds?: Set<number> | null;
};

export function PokemonGridWithFilters({
  filters,
  sortOption,
  searchTerm,
  onClearFilters,
  onSortChange,
  onPokemonSelect,
  includeIds,
}: Props) {
  const [page, setPage] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
  const [userConfirmedHeavyOperation, setUserConfirmedHeavyOperation] =
    useState(false);
  const [pendingOperation, setPendingOperation] = useState<
    "sorting" | "stat-filtering" | null
  >(null);

  const isMobile = useIsMobile();
  const pageSize = isMobile ? 12 : 30;
  const [mobileResults, setMobileResults] = useState<PokemonWithDetails[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isAppendingRef = useRef(false);
  const previousScrollMetricsRef = useRef<{
    height: number;
    scrollY: number;
  } | null>(null);
  const getScrollElement = () =>
    (document.scrollingElement as HTMLElement) || document.documentElement;

  const hasFilters =
    filters.types.length > 0 ||
    filters.generations.length > 0 ||
    filters.abilities.length > 0;
  const hasStatFilters = Object.values(filters.stats).some(
    ([min, max]) => min !== 1 || max !== 255
  );
  const hasSearch = searchTerm.trim() !== "";
  const hasAnyFilterOrSearch = hasFilters || hasSearch; // reduces dataset size up front
  const isSorting = sortOption.field !== "none";

  const needsHeavyOperationConfirmation =
    !hasAnyFilterOrSearch && (isSorting || hasStatFilters);

  const shouldFetchData =
    !needsHeavyOperationConfirmation || userConfirmedHeavyOperation;

  const includeIdsSet = includeIds ?? undefined;

  const { pokemon, totalCount, hasNextPage, loading, error } =
    useFilteredPokemon(
      filters,
      sortOption,
      searchTerm,
      page,
      pageSize,
      shouldFetchData,
      includeIdsSet
    );

  useEffect(() => {
    setPage(1);
    setMobileResults([]);
    isAppendingRef.current = false;
    previousScrollMetricsRef.current = null;
  }, [filters, sortOption, searchTerm]);

  // managing warning state
  useEffect(() => {
    if (needsHeavyOperationConfirmation && !userConfirmedHeavyOperation) {
      setShowWarning(true);
      setPendingOperation(hasStatFilters ? "stat-filtering" : "sorting");
      return;
    }
    setShowWarning(false);
    setPendingOperation(null);
    if (!needsHeavyOperationConfirmation) setUserConfirmedHeavyOperation(false);
  }, [
    needsHeavyOperationConfirmation,
    hasStatFilters,
    userConfirmedHeavyOperation,
  ]);

  // load more results on mobile
  useEffect(() => {
    if (!isMobile) return;
    if (page === 1) {
      setMobileResults(pokemon);
    } else if (pokemon && pokemon.length) {
      setMobileResults((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return prev.concat(pokemon.filter((p) => !seen.has(p.id)));
      });
    }
  }, [isMobile, page, pokemon]);

  // adjusting scroll
  useEffect(() => {
    if (!isMobile) return;
    if (!isAppendingRef.current) return;
    const scroller = getScrollElement();
    const prev = previousScrollMetricsRef.current;
    if (prev) {
      const newHeight = scroller.scrollHeight;
      const diff = newHeight - prev.height;
      scroller.scrollTop = prev.scrollY + diff;
    }
    isAppendingRef.current = false;
    previousScrollMetricsRef.current = null;
  }, [mobileResults, isMobile]);

  const handleWarningConfirm = () => {
    setShowWarning(false);
    setPendingOperation(null);
    setUserConfirmedHeavyOperation(true);
  };

  const handleAddFilters = () => {
    setShowWarning(false);
    setPendingOperation(null);
    onClearFilters();
    if (onSortChange) onSortChange(DEFAULT_SORT);
  };

  if (showWarning && pendingOperation) {
    return (
      <>
        <HeavyOperationDialog
          isOpen={showWarning}
          operationType={pendingOperation}
          onConfirm={handleWarningConfirm}
          onAddFilters={handleAddFilters}
        />
        <div className="text-center py-12">
          <p className="text-slate-600">
            {pendingOperation === "stat-filtering"
              ? "Ready to filter Pokemon by stats..."
              : "Ready to sort all Pokemon..."}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Choose your preference in the dialog above
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <EmptyState
        title={`Error loading Pokemon: ${error}`}
        subtitle="Please try again."
      />
    );
  }

  if (loading && page === 1) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-slate-600 mt-2">Loading Pokemon...</p>
      </div>
    );
  }

  if (pokemon.length === 0 && page === 1) {
    const title = searchTerm
      ? `No Pokemon found matching "${searchTerm}".`
      : "No Pokemon found matching your filters.";
    return (
      <EmptyState
        title={title}
        subtitle="Try adjusting your search criteria."
      />
    );
  }

  const itemsToRender: PokemonWithDetails[] = isMobile
    ? mobileResults
    : pokemon;

  const handleLoadMoreMobile = () => {
    if (!hasNextPage) return;
    isAppendingRef.current = true;
    const scroller = getScrollElement();
    previousScrollMetricsRef.current = {
      height: scroller.scrollHeight,
      scrollY: scroller.scrollTop,
    };
    setPage((p) => p + 1);
  };

  return (
    <div ref={containerRef} className="min-h-[50vh] flex flex-col">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 flex-none">
        {itemsToRender.map((p) => (
          <PokemonCard
            key={p.id}
            id={p.id}
            name={p.name}
            img={p.img}
            types={p.types}
            stats={{
              hp: p.stats.hp,
              attack: p.stats.attack,
              defense: p.stats.defense,
            }}
            onOpen={onPokemonSelect}
          />
        ))}
      </div>

      {isMobile ? (
        <div className="mt-4 flex items-center justify-center">
          <button
            className="btn"
            disabled={!hasNextPage}
            onClick={handleLoadMoreMobile}
          >
            {loading && page > 1
              ? "Loading…"
              : hasNextPage
                ? "Load more"
                : "No more"}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between">
          <button
            className="btn"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">
            Page {page} / {Math.max(1, Math.ceil(totalCount / pageSize))}
          </span>
          <button
            className="btn"
            disabled={!hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            {loading && page > 1 ? "Loading…" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
