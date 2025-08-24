import PokemonCard from "./PokemonCard";
import { usePokemonInfinite } from "../api/usePokemonList";

export function PokemonGridMobile() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePokemonInfinite(20);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((p) => (
          <PokemonCard key={p.id} id={p.id} name={p.name} img={p.img} />
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
