import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import { usePokemonDetails } from "../api/usePokemonDetails";
import { artworkUrl, TYPE_COLORS } from "../utils/pokemon";

type Props = {
  pokemonId: number | null;
  onClose: () => void;
};

export function PokemonModal({ pokemonId, onClose }: Props) {
  const {
    data: pokemon,
    isLoading,
    isError,
  } = usePokemonDetails(pokemonId || undefined);
  const [favourite, setFavourite] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (pokemonId) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [pokemonId, onClose]);

  if (!pokemonId) return null;

  const getStatBarColor = (index: number) => {
    if (!pokemon?.types) return "#3b82f6"; // Default blue

    const primaryType = pokemon.types[0]?.type.name;
    const secondaryType = pokemon.types[1]?.type.name;

    if (secondaryType && pokemon.types.length === 2) {
      const colors = {
        primary: getTypeColorValue(primaryType),
        secondary: getTypeColorValue(secondaryType),
      };
      return index % 2 === 0 ? colors.primary : colors.secondary;
    } else {
      return getTypeColorValue(primaryType);
    }
  };

  // Helper function to get actual color values that match TYPE_COLORS exactly
  const getTypeColorValue = (typeName: string): string => {
    // These hex values match the Tailwind colors used in TYPE_COLORS
    const typeColorMap: Record<string, string> = {
      normal: "#a8a29e", // stone-400
      fire: "#f97316", // orange-500
      water: "#0ea5e9", // sky-500
      grass: "#22c55e", // green-500
      electric: "#facc15", // yellow-400
      ice: "#22d3ee", // cyan-400
      fighting: "#dc2626", // red-600
      poison: "#c026d3", // fuchsia-600
      ground: "#a16207", // yellow-700
      flying: "#818cf8", // indigo-400
      psychic: "#ec4899", // pink-500
      bug: "#65a30d", // lime-600
      rock: "#b45309", // amber-700
      ghost: "#7c3aed", // violet-700
      dragon: "#4338ca", // indigo-700
      dark: "#374151", // gray-700
      steel: "#64748b", // slate-500
      fairy: "#fb7185", // rose-400
    };
    return typeColorMap[typeName] || "#3b82f6";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pokemon-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label={favourite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favourite}
          onClick={(e) => {
            e.stopPropagation();
            setFavourite((v) => !v);
          }}
          className="absolute top-6 left-6 z-10 p-2 bg-transparent rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 group/fav"
        >
          <Star
            className={
              favourite
                ? "text-[var(--accent)] transition-colors group-hover/fav:text-[var(--accent-soft)]"
                : "text-slate-400 transition-colors group-hover/fav:text-[var(--accent-soft)]"
            }
            fill={favourite ? "currentColor" : "none"}
          />
        </button>

        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading Pokemon details...</p>
          </div>
        )}

        {isError && (
          <div className="p-8 text-center">
            <p className="text-red-600">
              Failed to load Pokemon details. Please try again.
            </p>
          </div>
        )}

        {pokemon && (
          <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative">
                <img
                  src={artworkUrl(pokemon.id)}
                  alt={pokemon.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                />
              </div>

              <div className="text-center sm:text-left">
                <h2
                  id="pokemon-modal-title"
                  className="text-3xl font-bold capitalize mb-2"
                >
                  {pokemon.name}
                </h2>
                <p className="text-gray-600 text-lg mb-4">
                  #{pokemon.id.toString().padStart(3, "0")}
                </p>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {pokemon.types.map((type) => (
                    <span
                      key={type.type.name}
                      className={`px-3 py-1 rounded text-sm font-medium capitalize text-white ${TYPE_COLORS[type.type.name] ?? "bg-slate-400"}`}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Base Stats</h3>
              <div className="space-y-3">
                {pokemon.stats.map((stat, index) => {
                  const percentage = (stat.base_stat / 255) * 100;
                  const statName = stat.stat.name
                    .replace("special-attack", "Sp. Attack")
                    .replace("special-defense", "Sp. Defense")
                    .replace(/\b\w/g, (l) => l.toUpperCase());

                  return (
                    <div
                      key={stat.stat.name}
                      className="flex items-center gap-4"
                    >
                      <div className="w-20 text-sm font-medium text-gray-700 text-right">
                        {statName}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getStatBarColor(index),
                          }}
                        />
                      </div>
                      <div className="w-12 text-sm font-bold text-right">
                        {stat.base_stat}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    {pokemon.stats.reduce(
                      (sum, stat) => sum + stat.base_stat,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Abilities</h3>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((ability) => (
                  <span
                    key={ability.ability.name}
                    className="px-3 py-1.5 rounded text-sm font-medium capitalize bg-blue-100 text-blue-800"
                  >
                    {ability.ability.name.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
