import { useQuery } from "@tanstack/react-query";
import { fetchPokemonById } from "./pokemonApi";

export function usePokemonDetails(id?: number) {
  return useQuery({
    enabled: !!id,
    queryKey: ["pokemon", id],
    queryFn: () => fetchPokemonById(id!),
    staleTime: 5 * 60_000,
  });
}
