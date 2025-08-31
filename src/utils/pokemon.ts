export const artworkUrl = (id: number) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};
//badges
export const TYPE_COLORS: Record<string, string> = {
  normal: "bg-stone-400",
  fire: "bg-orange-500",
  water: "bg-sky-500",
  grass: "bg-green-500",
  electric: "bg-yellow-400 text-slate-900",
  ice: "bg-cyan-400",
  fighting: "bg-red-600",
  poison: "bg-fuchsia-600",
  ground: "bg-yellow-700",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-600",
  rock: "bg-amber-700",
  ghost: "bg-violet-700",
  dragon: "bg-indigo-700",
  dark: "bg-zinc-700",
  steel: "bg-slate-500",
  fairy: "bg-rose-300",
};

export const TYPE_HEX: Record<string, string> = {
  normal: "#a8a29e",
  fire: "#f97316",
  water: "#0ea5e9",
  grass: "#22c55e",
  electric: "#facc15",
  ice: "#22d3ee",
  fighting: "#dc2626",
  poison: "#c026d3",
  ground: "#a16207",
  flying: "#818cf8",
  psychic: "#ec4899",
  bug: "#65a30d",
  rock: "#b45309",
  ghost: "#7c3aed",
  dragon: "#4338ca",
  dark: "#374151",
  steel: "#64748b",
  fairy: "#fda4af",
};

export const typeHex = (t?: string) => TYPE_HEX[t ?? ""] ?? "#3b82f6";

//Za stat bar: ako postoje 2 tipa naizmjenično izmjenjuj
export function statBarColorHex(typeNames: string[], idx: number) {
  const [a, b] = typeNames;
  return b ? (idx % 2 === 0 ? typeHex(a) : typeHex(b)) : typeHex(a);
}
