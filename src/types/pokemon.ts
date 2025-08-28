export type PokemonListItem = { id: number; name: string; img: string };

export type PokemonListAPI = {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
};

export type PokemonDetail = {
  id: number;
  name: string;
  types: { slot: number; type: { name: string; url: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string; url: string }; is_hidden: boolean }[];
  species: { name: string; url: string };
};

export type PokemonFilters = {
  types: string[];
  typeMatchMode: "any" | "all";
  generations: number[];
  stats: {
    hp: [number, number];
    attack: [number, number];
    defense: [number, number];
    speed: [number, number];
  };
  abilities: string[];
};

export type SortOption = {
  field:
    | "none"
    | "name"
    | "totalPower"
    | "generation"
    | "attack"
    | "defense"
    | "speed";
  direction: "asc" | "desc";
};

export type PokemonWithDetails = {
  id: number;
  name: string;
  img: string;
  types: string[];
  generation: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    totalPower: number;
  };
  abilities: string[];
};

export type FilterState = {
  isFilteringEnabled: boolean;
  appliedFilters: PokemonFilters;
};

export type FilteredPokemonResult = {
  items: PokemonListItem[];
  total: number;
  hasMore: boolean;
};
