import type { PokemonFilters, SortOption } from "../types/pokemon";

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

export const POKEMON_GENERATIONS = [
  { id: 1, name: "Generation I", range: [1, 151] },
  { id: 2, name: "Generation II", range: [152, 251] },
  { id: 3, name: "Generation III", range: [252, 386] },
  { id: 4, name: "Generation IV", range: [387, 493] },
  { id: 5, name: "Generation V", range: [494, 649] },
  { id: 6, name: "Generation VI", range: [650, 721] },
  { id: 7, name: "Generation VII", range: [722, 809] },
  { id: 8, name: "Generation VIII", range: [810, 905] },
  { id: 9, name: "Generation IX", range: [906, 1025] },
];

export const COMMON_ABILITIES = [
  "overgrow",
  "blaze",
  "torrent",
  "static",
  "flash-fire",
  "water-absorb",
  "chlorophyll",
  "solar-power",
  "thick-fat",
  "guts",
  "early-bird",
  "flame-body",
  "swift-swim",
  "rock-head",
  "sturdy",
  "suction-cups",
  "intimidate",
  "hyper-cutter",
  "sand-veil",
  "effect-spore",
  "synchronize",
  "clear-body",
  "natural-cure",
  "lightning-rod",
  "serene-grace",
  "keen-eye",
];

export const DEFAULT_FILTERS: PokemonFilters = {
  types: [],
  typeMatchMode: "any",
  generations: [],
  stats: {
    hp: [1, 255],
    attack: [1, 255],
    defense: [1, 255],
    speed: [1, 255],
  },
  abilities: [],
};

export const DEFAULT_SORT: SortOption = {
  field: "none",
  direction: "asc",
};

// Generation name to number mapping for sorting
export const GENERATION_NAME_TO_NUMBER: Record<string, number> = {
  "generation-i": 1,
  "generation-ii": 2,
  "generation-iii": 3,
  "generation-iv": 4,
  "generation-v": 5,
  "generation-vi": 6,
  "generation-vii": 7,
  "generation-viii": 8,
  "generation-ix": 9,
};

// Reusable list of stat keys (stays in sync with DEFAULT_FILTERS.stats)
export const STAT_KEYS = Object.keys(DEFAULT_FILTERS.stats) as Array<
  keyof PokemonFilters["stats"]
>;

export const STAT_NAMES = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  speed: "Speed",
} as const;

export function filtersToURLParams(filters: PokemonFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.types.length > 0) {
    params.set("types", filters.types.join(","));
  }

  if (filters.typeMatchMode !== "any") {
    params.set("typeMatchMode", filters.typeMatchMode);
  }

  if (filters.generations.length > 0) {
    params.set("generations", filters.generations.join(","));
  }

  // Only add stat ranges if they're not default
  Object.entries(filters.stats).forEach(([stat, [min, max]]) => {
    if (min !== 1 || max !== 255) {
      params.set(`${stat}_min`, min.toString());
      params.set(`${stat}_max`, max.toString());
    }
  });

  if (filters.abilities.length > 0) {
    params.set("abilities", filters.abilities.join(","));
  }

  return params;
}

export function urlParamsToFilters(params: URLSearchParams): PokemonFilters {
  const filters: PokemonFilters = JSON.parse(JSON.stringify(DEFAULT_FILTERS));

  const types = params.get("types");
  if (types) {
    filters.types = types.split(",").filter((t) => POKEMON_TYPES.includes(t));
  }

  const typeMatchMode = params.get("typeMatchMode");
  if (typeMatchMode === "all") {
    filters.typeMatchMode = "all";
  }

  const generations = params.get("generations");
  if (generations) {
    filters.generations = generations
      .split(",")
      .map((g) => parseInt(g))
      .filter((g) => g >= 1 && g <= 9);
  }

  STAT_KEYS.forEach((stat) => {
    const min = params.get(`${stat}_min`);
    const max = params.get(`${stat}_max`);
    if (min) filters.stats[stat][0] = Math.max(1, parseInt(min));
    if (max) filters.stats[stat][1] = Math.min(255, parseInt(max));
  });

  const abilities = params.get("abilities");
  if (abilities) {
    filters.abilities = abilities.split(",");
  }

  return filters;
}

export function hasActiveFilters(filters: PokemonFilters): boolean {
  return (
    filters.types.length > 0 ||
    filters.generations.length > 0 ||
    Object.values(filters.stats).some(
      ([min, max]) => min !== 1 || max !== 255
    ) ||
    filters.abilities.length > 0
  );
}

export const unionSets = (sets: Array<Set<number>>): Set<number> => {
  const out = new Set<number>();
  for (const s of sets) s.forEach((id) => out.add(id));
  return out;
};

export const intersectTwo = (a: Set<number>, b: Set<number>): Set<number> => {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  const out = new Set<number>();
  for (const id of small) if (large.has(id)) out.add(id);
  return out;
};

export const intersectAll = (sets: Array<Set<number>>): Set<number> => {
  if (sets.length === 0) return new Set<number>();
  return sets.reduce((acc, s) => intersectTwo(acc, s));
};
