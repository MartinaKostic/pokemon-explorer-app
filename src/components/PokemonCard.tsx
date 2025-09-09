import { Star } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { PokemonCardInfo } from "./PokemonCardInfo";
import { artworkUrl } from "../utils/pokemon";

type Props = {
  id: number;
  name: string;
  img: string;
  speciesId?: number;
  onOpen?: (id: number) => void;
  types?: string[];
  stats?: { hp: number; attack: number; defense: number };
};

export default function PokemonCard({
  id,
  name,
  img,
  speciesId,
  onOpen,
  types,
  stats,
}: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favourite = isFavorite(id);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.currentTarget;

    // If we have a species ID and it's different from the pokemon ID, try the species artwork
    if (
      speciesId &&
      speciesId !== id &&
      imgElement.src.includes(`/${id}.png`)
    ) {
      imgElement.src = artworkUrl(speciesId);
      return;
    }

    // If everything else fails
    imgElement.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Ctext x='100' y='100' text-anchor='middle' dy='0.3em' font-family='sans-serif' font-size='14' fill='%2364748b'%3E" +
      encodeURIComponent(name) +
      "%3C/text%3E%3C/svg%3E";
  };

  return (
    <article className="group/card card" role="group">
      <button
        type="button"
        aria-label={favourite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favourite}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(id);
        }}
        className="group/fav absolute right-2 top-2 z-20 p-0 bg-transparent rounded-full
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
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

      <button
        type="button"
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        onClick={() => onOpen?.(id)}
      >
        <img
          src={img}
          alt={name}
          className="card-img"
          loading="lazy"
          onError={handleImageError}
        />
        <span className="mt-1 block text-sm font-medium capitalize">
          {name}
        </span>
        <PokemonCardInfo id={id} types={types} stats={stats} />
      </button>
    </article>
  );
}
