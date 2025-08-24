export const artworkUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

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
  fairy: "bg-rose-400",
};
