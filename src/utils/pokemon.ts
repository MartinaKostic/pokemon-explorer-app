export const artworkUrl = (id: number) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};

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

// Type color mappings for modal styling
const TYPE_COLOR_VALUES: Record<
  string,
  { primary: string; background: string }
> = {
  normal: { primary: "#a8a878", background: "#f5f5f0" },
  fire: { primary: "#f08030", background: "#fef2e8" },
  water: { primary: "#6890f0", background: "#e8f4ff" },
  grass: { primary: "#78c850", background: "#f0fdf4" },
  electric: { primary: "#f8d030", background: "#fffbeb" },
  ice: { primary: "#98d8d8", background: "#f0fdfa" },
  fighting: { primary: "#c03028", background: "#fef2f2" },
  poison: { primary: "#a040a0", background: "#faf5ff" },
  ground: { primary: "#e0c068", background: "#fffbeb" },
  flying: { primary: "#a890f0", background: "#f5f3ff" },
  psychic: { primary: "#f85888", background: "#fdf2f8" },
  bug: { primary: "#a8b820", background: "#f7fee7" },
  rock: { primary: "#b8a038", background: "#fffbeb" },
  ghost: { primary: "#705898", background: "#f5f3ff" },
  dragon: { primary: "#7038f8", background: "#f5f3ff" },
  dark: { primary: "#705848", background: "#f8fafc" },
  steel: { primary: "#b8b8d0", background: "#f8fafc" },
  fairy: { primary: "#ee99ac", background: "#fdf2f8" },
};

export function getTypeColor(type: string): {
  primary: string;
  background: string;
} {
  return TYPE_COLOR_VALUES[type.toLowerCase()] || TYPE_COLOR_VALUES.normal;
}
