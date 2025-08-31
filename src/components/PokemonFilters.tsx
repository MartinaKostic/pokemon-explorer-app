import { useEffect, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, X } from "lucide-react";
import type { PokemonFilters } from "../types/pokemon";
import {
  COMMON_ABILITIES,
  DEFAULT_FILTERS,
  POKEMON_GENERATIONS,
  POKEMON_TYPES,
  STAT_NAMES,
} from "../utils/filters";
import { TYPE_COLORS } from "../utils/pokemon";
import {
  MIN_STAT_VALUE,
  MAX_STAT_VALUE,
  STAT_INPUT_MAX_LENGTH,
} from "../constants";

type Props = {
  filters: PokemonFilters;
  onFiltersChange: (filters: PokemonFilters) => void;
  onApplyFilters?: () => void;
  onApplyFiltersNow?: (next: PokemonFilters) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
};

export function PokemonFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onApplyFiltersNow,
  onClearFilters,
  hasActiveFilters = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [statsResetTick, setStatsResetTick] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    types: true,
    generation: true,
    stats: true,
    abilities: true,
  });
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [isOpen]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilters = (updates: Partial<PokemonFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    updateFilters({ types: newTypes });
  };

  const toggleGeneration = (generation: number) => {
    const newGenerations = filters.generations.includes(generation)
      ? filters.generations.filter((g) => g !== generation)
      : [...filters.generations, generation];
    updateFilters({ generations: newGenerations });
  };

  // match mode controlled via segmented buttons below

  const toggleAbility = (ability: string) => {
    const newAbilities = filters.abilities.includes(ability)
      ? filters.abilities.filter((a) => a !== ability)
      : [...filters.abilities, ability];
    updateFilters({ abilities: newAbilities });
  };

  const updateStat = (
    stat: keyof typeof filters.stats,
    index: 0 | 1,
    value: string
  ) => {
    const parsed = parseInt(value, 10);
    const clamped = Number.isFinite(parsed)
      ? Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, parsed))
      : filters.stats[stat][index];

    const newStats = { ...filters.stats };
    if (index === 0) newStats[stat] = [clamped, newStats[stat][1]];
    else newStats[stat] = [newStats[stat][0], clamped];
    updateFilters({ stats: newStats });
  };

  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFiltersChange(DEFAULT_FILTERS);
    }
  };

  const applyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters();
    }
    setIsOpen(false);
  };

  const activeFiltersCount = hasActiveFilters
    ? filters.types.length +
      filters.generations.length +
      Object.values(filters.stats).filter(
        ([min, max]) => min !== MIN_STAT_VALUE || max !== MAX_STAT_VALUE
      ).length +
      filters.abilities.length
    : 0;

  const activeStatsCount = Object.values(filters.stats).filter(
    ([min, max]) => min !== MIN_STAT_VALUE || max !== MAX_STAT_VALUE
  ).length;

  // Collapsible section with badge count + inline reset X
  const CollapsibleSection = ({
    title,
    isExpanded,
    onToggle,
    count,
    onReset,
    children,
  }: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    count?: number;
    onReset?: () => void;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-slate-50 px-2 rounded"
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-medium">{title}</span>
          {count !== undefined && count > 0 && (
            <span
              className="inline-flex items-center text-white text-[11px] rounded-full pl-1.5 pr-1 py-0.5"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <span className="px-0.5 leading-none">{count}</span>
              {onReset && (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Reset ${title}`}
                  className="ml-1 w-4 h-4 grid place-items-center rounded-full hover:bg-white/20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReset();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onReset();
                    }
                  }}
                >
                  <X size={10} />
                </div>
              )}
            </span>
          )}
        </div>
        {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
      </button>
      {isExpanded && <div className="pb-4 px-2">{children}</div>}
    </div>
  );

  // Reusable filter sections
  const TypesSection = () => (
    <CollapsibleSection
      title="Types"
      isExpanded={expandedSections.types}
      onToggle={() => toggleSection("types")}
      count={filters.types.length}
      onReset={
        filters.types.length
          ? () => {
              const next = {
                ...filters,
                types: [],
                typeMatchMode: "any" as const,
              };
              if (onApplyFiltersNow) onApplyFiltersNow(next);
              else updateFilters({ types: [], typeMatchMode: "any" });
            }
          : undefined
      }
    >
      {filters.types.length > 1 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-slate-600">Match rule:</span>
          <div className="inline-flex rounded-md border border-slate-300 overflow-hidden">
            <button
              className={`px-2 py-1 text-xs ${
                filters.typeMatchMode === "any"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => updateFilters({ typeMatchMode: "any" })}
            >
              Any selected
            </button>
            <button
              className={`px-2 py-1 text-xs border-l border-slate-300 ${
                filters.typeMatchMode === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => updateFilters({ typeMatchMode: "all" })}
            >
              All selected
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {POKEMON_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`px-3 py-2 text-sm rounded-md capitalize transition-colors ${
              filters.types.includes(type)
                ? `${TYPE_COLORS[type]} text-white`
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </CollapsibleSection>
  );

  const GenerationSection = () => (
    <CollapsibleSection
      title="Generation"
      isExpanded={expandedSections.generation}
      onToggle={() => toggleSection("generation")}
      count={filters.generations.length}
      onReset={
        filters.generations.length
          ? () => {
              const next = { ...filters, generations: [] };
              if (onApplyFiltersNow) onApplyFiltersNow(next);
              else updateFilters({ generations: [] });
            }
          : undefined
      }
    >
      <div className="flex flex-wrap gap-2">
        {POKEMON_GENERATIONS.map((gen) => (
          <button
            key={gen.id}
            onClick={() => toggleGeneration(gen.id)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              filters.generations.includes(gen.id)
                ? "bg-blue-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Gen {gen.id}
          </button>
        ))}
      </div>
    </CollapsibleSection>
  );

  const StatsSection = () => (
    <CollapsibleSection
      title="Base Stats"
      isExpanded={expandedSections.stats}
      onToggle={() => toggleSection("stats")}
      count={activeStatsCount}
      onReset={
        activeStatsCount
          ? () => {
              const resetStats = Object.fromEntries(
                Object.entries(DEFAULT_FILTERS.stats).map(([k, v]) => [
                  k,
                  [v[0], v[1]] as [number, number],
                ])
              ) as typeof filters.stats;
              if (onApplyFiltersNow)
                onApplyFiltersNow({ ...filters, stats: resetStats });
              else updateFilters({ stats: resetStats });
              setStatsResetTick((t) => t + 1);
            }
          : undefined
      }
    >
      <div className="space-y-4" key={statsResetTick}>
        {(Object.keys(filters.stats) as Array<keyof typeof filters.stats>).map(
          (stat) => (
            <div key={stat}>
              <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                <span className="font-medium">{STAT_NAMES[stat]}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={STAT_INPUT_MAX_LENGTH}
                    defaultValue={filters.stats[stat][0].toString()}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v) updateStat(stat, 0, v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-16 px-2 py-1 border border-slate-300 rounded brand-focus text-right"
                  />
                  <span>–</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={STAT_INPUT_MAX_LENGTH}
                    defaultValue={filters.stats[stat][1].toString()}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v) updateStat(stat, 1, v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-16 px-2 py-1 border border-slate-300 rounded brand-focus text-right"
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </CollapsibleSection>
  );

  const AbilitiesSection = () => (
    <CollapsibleSection
      title="Common Abilities"
      isExpanded={expandedSections.abilities}
      onToggle={() => toggleSection("abilities")}
      count={filters.abilities.length}
      onReset={
        filters.abilities.length
          ? () => {
              const next = { ...filters, abilities: [] };
              if (onApplyFiltersNow) onApplyFiltersNow(next);
              else updateFilters({ abilities: [] });
            }
          : undefined
      }
    >
      <div className="flex flex-wrap gap-2">
        {COMMON_ABILITIES.map((ability) => (
          <button
            key={ability}
            onClick={() => {
              const scroller = scrollContainerRef.current;
              const y = scroller ? scroller.scrollTop : 0;
              toggleAbility(ability);
              if (scroller)
                requestAnimationFrame(() => (scroller.scrollTop = y));
            }}
            className={`px-3 py-2 text-sm rounded-md capitalize transition-colors ${
              filters.abilities.includes(ability)
                ? "bg-amber-400 text-slate-900"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {ability.replace("-", " ")}
          </button>
        ))}
      </div>
    </CollapsibleSection>
  );

  const FilterActions = () => (
    <div className="border-t border-slate-200 p-4 sticky bottom-0 bg-white">
      <div className="flex gap-3 justify-end">
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:border-slate-400"
          >
            Clear All
          </button>
        )}
        <button
          onClick={applyFilters}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
          disabled={!hasActiveFilters}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {/* Filters button */}
      <div ref={filtersRef} className="relative">
        <button
          id="filters-trigger-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="btn justify-between inline-flex w-full"
          style={{
            backgroundColor: activeFiltersCount > 0 ? "#f0f8ff" : undefined,
            borderColor: activeFiltersCount > 0 ? "var(--brand)" : undefined,
            color: activeFiltersCount > 0 ? "var(--brand-600)" : undefined,
          }}
        >
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span
              className="text-white text-xs rounded-full px-1.5 py-0.5 ml-1"
              style={{ backgroundColor: "var(--brand)" }}
            >
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <div
              className="fixed inset-0 z-40 md:hidden bg-black/10"
              onClick={() => setIsOpen(false)}
            />

            {/* Desktop dropdown */}
            <div
              ref={scrollContainerRef}
              className="hidden md:block absolute top-full right-0 z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-slate-200 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <TypesSection />
                <GenerationSection />
                <StatsSection />
                <AbilitiesSection />
              </div>

              <FilterActions />
            </div>

            {/* Mobile sheet: full screen overlay for clarity */}
            <div className="md:hidden fixed inset-0 z-50 bg-white overflow-y-auto">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <TypesSection />
                <GenerationSection />
                <StatsSection />
                <AbilitiesSection />
              </div>
              <FilterActions />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
