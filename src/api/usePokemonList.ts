import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  fetchPokemonById,
  fetchPokemonPage,
  fetchPokemonPageByUrl,
} from "./pokemonApi";

export function usePokemonPage(page = 0, pageSize = 24) {
  const offset = page * pageSize;
  return useQuery({
    queryKey: ["pokemonPage", page, pageSize],
    queryFn: () => fetchPokemonPage(pageSize, offset),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
//inifinite scroll
export function usePokemonInfinite(pageSize = 24) {
  const first = `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=0`;

  return useInfiniteQuery({
    queryKey: ["pokemonInfinite", pageSize],
    initialPageParam: first,
    queryFn: ({ pageParam }) => fetchPokemonPageByUrl(pageParam),
    getNextPageParam: (lastPage) => lastPage.next,
    staleTime: 60_000,
  });
}
//optional
export { fetchPokemonById };
