import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { fetchPokemonPage, fetchPokemonPageByUrl } from "./pokemonApi";
import {
  DEFAULT_PAGE_SIZE,
  API_BASE_URL,
  QUERY_STALE_TIME_MS,
} from "../constants";

export function usePokemonPage(page = 0, pageSize = DEFAULT_PAGE_SIZE) {
  const offset = page * pageSize;
  return useQuery({
    queryKey: ["pokemonPage", page, pageSize],
    queryFn: () => fetchPokemonPage(pageSize, offset),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

//infinite scroll
export function usePokemonInfinite(pageSize = DEFAULT_PAGE_SIZE) {
  const first = `${API_BASE_URL}/pokemon?limit=${pageSize}&offset=0`;

  return useInfiniteQuery({
    queryKey: ["pokemonInfinite", pageSize],
    initialPageParam: first,
    queryFn: ({ pageParam }) => fetchPokemonPageByUrl(pageParam),
    getNextPageParam: (lastPage) => lastPage.next,
    staleTime: QUERY_STALE_TIME_MS,
  });
}
