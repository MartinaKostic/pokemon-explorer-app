import type {
  PokemonDetail,
  PokemonListAPI,
  PokemonListItem,
} from "../types/pokemon";
import { artworkUrl } from "../utils/pokemon";

const API = "https://pokeapi.co/api/v2";

function mapList(data: PokemonListAPI, limit: number, offset: number) {
  const items: PokemonListItem[] = data.results.map((r) => {
    const id = Number(new URL(r.url).pathname.split("/").filter(Boolean).pop());
    return { id, name: r.name, img: artworkUrl(id) };
  });
  return {
    items,
    count: data.count,
    next: data.next,
    previous: data.previous,
    limit,
    offset,
  };
}

export async function fetchPokemonPage(limit = 24, offset = 0) {
  const res = await fetch(`${API}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch Pokemon list");
  const data: PokemonListAPI = await res.json();
  return mapList(data, limit, offset);
}

export async function fetchPokemonPageByUrl(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Pokemon list");
  const data: PokemonListAPI = await res.json();

  const u = new URL(url);
  const limit = Number(u.searchParams.get("limit") ?? 24);
  const offset = Number(u.searchParams.get("offset") ?? 0);

  return mapList(data, limit, offset);
}

export async function fetchPokemonById(id: number): Promise<PokemonDetail> {
  const res = await fetch(`${API}/pokemon/${id}`);
  if (!res.ok) throw new Error("Failed to fetch Pokemon");
  return res.json();
}
