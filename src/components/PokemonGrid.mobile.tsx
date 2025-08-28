import PokemonCard from "./PokemonCard";
import { usePokemonInfinite } from "../api/usePokemonList";

type Props = {
  onPokemonSelect?: (id: number) => void;
};

export function PokemonGridMobile({ onPokemonSelect }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePokemonInfinite(12);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {items.map((p) => (
          <PokemonCard
            key={p.id}
            id={p.id}
            name={p.name}
            img={p.img}
            onOpen={onPokemonSelect}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        {hasNextPage && (
          <button
            className="btn"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </>
  );
}
