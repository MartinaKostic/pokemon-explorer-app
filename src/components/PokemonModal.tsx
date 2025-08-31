import { useEffect } from "react";
import { X, Star } from "lucide-react";
import { usePokemonDetails } from "../api/usePokemonDetails";
import { artworkUrl, statBarColorHex, TYPE_COLORS } from "../utils/pokemon";
import { useFavorites } from "../hooks/useFavorites";

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
  const { isFavorite, toggleFavorite } = useFavorites();
  const typeNames = pokemon?.types?.map((t) => t.type.name) ?? [];
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
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

        {/* Content */}

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
            <div className="flex flex-col sm:flex-row-reverse items-center gap-8 mb-6">
              <div className="relative">
                <img
                  src={artworkUrl(pokemon.id)}
                  alt={pokemon.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                  onError={(e) => {
                    // Fallback when form artwork is missing
                    const url = pokemon.species?.url;
                    const sid = url
                      ? Number(
                          new URL(url).pathname.split("/").filter(Boolean).pop()
                        )
                      : NaN;
                    if (!Number.isNaN(sid))
                      (e.currentTarget as HTMLImageElement).src =
                        artworkUrl(sid);
                  }}
                />
              </div>

              <div className="text-center sm:text-left">
                <div className="relative sm:ml-5">
                  <button
                    type="button"
                    aria-label={
                      pokemonId && isFavorite(pokemonId)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    aria-pressed={pokemonId ? isFavorite(pokemonId) : false}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pokemonId) toggleFavorite(pokemonId);
                    }}
                    className="absolute -left-6 md:-left-7 top-1 p-1 bg-transparent rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 group/fav"
                    title={
                      isFavorite(pokemonId ?? -1)
                        ? "Favorited"
                        : "Add to favorites"
                    }
                  >
                    <Star
                      className={
                        pokemonId && isFavorite(pokemonId)
                          ? "text-[var(--accent)] transition-colors group-hover/fav:text-[var(--accent-soft)]"
                          : "text-slate-400 transition-colors group-hover/fav:text-[var(--accent-soft)]"
                      }
                      fill={
                        pokemonId && isFavorite(pokemonId)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                  <h2
                    id="pokemon-modal-title"
                    className="text-3xl font-bold capitalize mb-2"
                  >
                    {pokemon.name}
                  </h2>
                  <p className="text-gray-600 text-lg mb-3">
                    #{pokemon.id.toString().padStart(3, "0")}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-start">
                    {pokemon.types.map((type) => (
                      <span
                        key={type.type.name}
                        className={`px-3 py-1 rounded text-sm font-medium capitalize text-white ${TYPE_COLORS[type.type.name] ?? "bg-slate-400"}`}
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>

                  {/* Species/Height/Weight stacked under the badges */}
                  <div className="mt-3 text-sm text-slate-600 space-y-1">
                    <div><span className="font-semibold">Species:</span> {pokemon.species?.name ?? "—"}</div>
                    <div>
                      <span className="font-semibold">Height:</span> {(pokemon.height ?? 0) / 10} m
                      <span className="mx-2 text-slate-400">•</span>
                      <span className="font-semibold">Weight:</span> {(pokemon.weight ?? 0) / 10} kg
                    </div>
                </div>
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
                            backgroundColor: statBarColorHex(typeNames, index),
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium capitalize bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {ability.ability.name.replace(/-/g, " ")}
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
