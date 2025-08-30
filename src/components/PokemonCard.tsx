import { Star } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { PokemonCardInfo } from "./PokemonCardInfo";

type Props = {
  id: number;
  name: string;
  img: string;
  onOpen?: (id: number) => void;
  types?: string[];
  stats?: { hp: number; attack: number; defense: number };
};

export default function PokemonCard({
  id,
  name,
  img,
  onOpen,
  types,
  stats,
}: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favourite = isFavorite(id);

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
        <img src={img} alt={name} className="card-img" loading="lazy" />
        <span className="mt-1 block text-sm font-medium capitalize">
          {name}
        </span>
        <PokemonCardInfo id={id} types={types} stats={stats} />
      </button>
    </article>
  );
}
