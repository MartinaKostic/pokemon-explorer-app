import type {
  PokemonFilters,
  SortOption,
  PokemonWithDetails,
  PokemonDetail,
} from "../types/pokemon";
import { artworkUrl } from "../utils/pokemon";
import {
  intersectAll,
  intersectTwo,
  POKEMON_GENERATIONS,
  unionSets,
} from "../utils/filters";
import { queryClient } from "./queryClient";
import { fetchPokemonById } from "./pokemonApi";
import pLimit from "p-limit";

const API = "https://pokeapi.co/api/v2";

const CONCURRENCY = 20;

function extractIdFromUrl(url: string): number {
  return Number(new URL(url).pathname.split("/").filter(Boolean).pop());
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return (await response.json()) as T;
}

async function getPokemonIdsByType(typeName: string): Promise<Set<number>> {
  const data = await queryClient.ensureQueryData<{
    pokemon: { pokemon: { url: string } }[];
  }>({
    queryKey: ["type", typeName],
    queryFn: () => fetchJson(`${API}/type/${typeName}`),
    staleTime: 60 * 60 * 1000, // 1h
  });
  const ids = new Set<number>();

  data.pokemon.forEach((p: { pokemon: { url: string } }) => {
    const id = extractIdFromUrl(p.pokemon.url);
    ids.add(id);
  });

  return ids;
}

function getPokemonIdsByGeneration(generationId: number): Set<number> {
  const generation = POKEMON_GENERATIONS.find((g) => g.id === generationId);
  if (!generation) {
    console.warn(`Unknown generation ID: ${generationId}`);
    return new Set();
  }

  const ids = new Set<number>();
  const [start, end] = generation.range;
  for (let id = start; id <= end; id++) {
    ids.add(id);
  }

  return ids;
}

function getGenerationById(id: number): number {
  for (const gen of POKEMON_GENERATIONS) {
    const [start, end] = gen.range;
    if (id >= start && id <= end) return gen.id;
  }
  return 0;
}

async function getPokemonIdsByAbility(
  abilityName: string
): Promise<Set<number>> {
  const data = await queryClient.ensureQueryData<{
    pokemon: { pokemon: { url: string } }[];
  }>({
    queryKey: ["ability", abilityName],
    queryFn: () => fetchJson(`${API}/ability/${abilityName}`),
    staleTime: 60 * 60 * 1000, // 1h
  });
  const ids = new Set<number>();

  data.pokemon.forEach((p: { pokemon: { url: string } }) => {
    const id = extractIdFromUrl(p.pokemon.url);
    ids.add(id);
  });

  return ids;
}

// Get ALL Pokemon list for global operations (search, sorting-only)
async function getAllPokemonList(): Promise<{ id: number; name: string }[]> {
  try {
    const data = await queryClient.ensureQueryData<{
      results: { name: string; url: string }[];
      count: number;
    }>({
      queryKey: ["pokemonListAll"],
      // we have 1302 pokemons in total and we want to fetch all
      queryFn: () => fetchJson(`${API}/pokemon?limit=1500`),
      staleTime: 24 * 60 * 60 * 1000, // 24h
    });

    const list: { id: number; name: string }[] = [];
    data.results.forEach((pokemon) => {
      const id = extractIdFromUrl(pokemon.url);
      list.push({ id, name: pokemon.name });
    });

    return list;
  } catch (error) {
    console.error("Failed to fetch all Pokemon IDs:", error);
    throw error;
  }
}

async function getAllPokemonIds(): Promise<Set<number>> {
  const list = await getAllPokemonList();
  return new Set(list.map((p) => p.id));
}

// get pokemon ids that will be used later to fetch details about them
// used so we don't fetch 1302 pokemon details always
async function getCandidateIds(filters: PokemonFilters): Promise<Set<number>> {
  const typePromises: Promise<Set<number>>[] =
    filters.types.length > 0
      ? filters.types.map((type) => getPokemonIdsByType(type))
      : [];
  const abilityPromises: Promise<Set<number>>[] =
    filters.abilities.length > 0
      ? filters.abilities.map((ability) => getPokemonIdsByAbility(ability))
      : [];
  const generationSets: Set<number>[] =
    filters.generations.length > 0
      ? filters.generations.map((gen) => getPokemonIdsByGeneration(gen))
      : [];

  if (
    typePromises.length === 0 &&
    abilityPromises.length === 0 &&
    generationSets.length === 0
  ) {
    return await getAllPokemonIds();
  }

  const [typeResults, abilityResults] = await Promise.all([
    Promise.all(typePromises),
    Promise.all(abilityPromises),
  ]);

  let candidateIds: Set<number> | null = null;

  // Types
  if (filters.types.length > 0) {
    const typeCombined =
      filters.typeMatchMode === "all"
        ? intersectAll(typeResults)
        : unionSets(typeResults);

    candidateIds = typeCombined;
  }

  // Generations
  if (filters.generations.length > 0) {
    const generationIds = unionSets(generationSets);

    candidateIds = candidateIds
      ? intersectTwo(candidateIds, generationIds)
      : generationIds;
  }

  // Abilities
  if (filters.abilities.length > 0) {
    const abilityIds = unionSets(abilityResults);

    candidateIds = candidateIds
      ? intersectTwo(candidateIds, abilityIds)
      : abilityIds;
  }

  return candidateIds ?? new Set<number>();
}

async function fetchPokemonDetails(id: number): Promise<PokemonDetail | null> {
  try {
    const pokemon = await queryClient.ensureQueryData<PokemonDetail>({
      queryKey: ["pokemon", id],
      queryFn: () => fetchPokemonById(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
    return pokemon;
  } catch (error) {
    console.warn(`Failed to fetch Pokemon ${id}:`, error);
    return null;
  }
}

function convertToEnhancedPokemon(
  pokemon: PokemonDetail
): PokemonWithDetails | null {
  try {
    const generation = getGenerationById(pokemon.id);

    const statsMap = new Map<string, number>();
    pokemon.stats.forEach((stat) => {
      statsMap.set(stat.stat.name, stat.base_stat);
    });

    const stats = {
      hp: statsMap.get("hp") || 0,
      attack: statsMap.get("attack") || 0,
      defense: statsMap.get("defense") || 0,
      speed: statsMap.get("speed") || 0,
      totalPower: pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
    };

    return {
      id: pokemon.id,
      name: pokemon.name,
      img: artworkUrl(pokemon.id),
      types: pokemon.types.map((t) => t.type.name),
      generation,
      stats,
      abilities: pokemon.abilities.map((a) => a.ability.name),
    };
  } catch {
    return null;
  }
}

function matchesStatFilters(
  pokemon: PokemonWithDetails,
  statFilters: PokemonFilters["stats"]
): boolean {
  return Object.entries(statFilters).every(([statName, [min, max]]) => {
    const statValue = pokemon.stats[statName as keyof typeof pokemon.stats];
    return statValue >= min && statValue <= max;
  });
}

function sortPokemon(
  pokemon: PokemonWithDetails[],
  sortOption: SortOption
): PokemonWithDetails[] {
  if (sortOption.field === "none") {
    return pokemon;
  }

  // removing pokemons that are not part of any generation e.g. the ones with id of 10000+
  const workingSet =
    sortOption.field === "generation"
      ? pokemon.filter((p) => p.generation !== 0)
      : pokemon;

  return [...workingSet].sort((a, b) => {
    let comparison = 0;

    switch (sortOption.field) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "totalPower":
        comparison = a.stats.totalPower - b.stats.totalPower;
        break;
      case "generation":
        comparison = a.generation - b.generation;
        break;
      case "attack":
        comparison = a.stats.attack - b.stats.attack;
        break;
      case "defense":
        comparison = a.stats.defense - b.stats.defense;
        break;
      case "speed":
        comparison = a.stats.speed - b.stats.speed;
        break;
    }
    if (comparison === 0) {
      // Stable tiebreaker by id to avoid UI flicker
      comparison = a.id - b.id;
    }
    return sortOption.direction === "desc" ? -comparison : comparison;
  });
}

export async function fetchFilteredAndSortedPokemon(
  filters: PokemonFilters,
  sortOption: SortOption,
  searchTerm: string = "",
  page: number = 1,
  pageSize: number = 30
): Promise<{
  pokemon: PokemonWithDetails[];
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
}> {
  try {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const candidateIds = await getCandidateIds(filters);

    let filteredCandidateIds = candidateIds;
    if (normalizedSearch) {
      const fullList = await getAllPokemonList();
      const nameMatched = new Set(
        fullList
          .filter((p) => p.name.toLowerCase().includes(normalizedSearch))
          .map((p) => p.id)
      );
      filteredCandidateIds = new Set(
        [...candidateIds].filter((id) => nameMatched.has(id))
      );
    }

    const candidateArray = Array.from(filteredCandidateIds);

    if (candidateArray.length === 0) {
      return {
        pokemon: [],
        totalCount: 0,
        hasNextPage: false,
        currentPage: page,
      };
    }

    const limit = pLimit(CONCURRENCY);
    const enhancedPromises = candidateArray.map((id) =>
      limit(async () => {
        const detail = await fetchPokemonDetails(id);
        if (!detail) return null;
        const enhanced = convertToEnhancedPokemon(detail);
        if (!enhanced) return null;
        return matchesStatFilters(enhanced, filters.stats) ? enhanced : null;
      })
    );
    const allEnhanced = await Promise.all(enhancedPromises);
    let filtered = allEnhanced.filter(Boolean) as PokemonWithDetails[];

    if (sortOption.field !== "none") {
      filtered = sortPokemon(filtered, sortOption);
    }

    const totalCount = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filtered.slice(startIndex, endIndex);
    const hasNextPage = endIndex < totalCount;

    const result = {
      pokemon: paginatedResults,
      totalCount,
      hasNextPage,
      currentPage: page,
    };

    return result;
  } catch (error) {
    console.error("Error fetching filtered Pokemon:", error);
    return {
      pokemon: [],
      totalCount: 0,
      hasNextPage: false,
      currentPage: 1,
    };
  }
}

export function hasActiveFilterCriteria(filters: PokemonFilters): boolean {
  return (
    filters.types.length > 0 ||
    filters.generations.length > 0 ||
    filters.abilities.length > 0 ||
    Object.values(filters.stats).some(([min, max]) => min !== 1 || max !== 255)
  );
}
