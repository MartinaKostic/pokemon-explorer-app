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
};
