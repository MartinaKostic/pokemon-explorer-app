import { useState } from "react";
import PokemonCard from "./PokemonCard";
import { usePokemonPage } from "../api/usePokemonList";

type Props = {
  onPokemonSelect?: (id: number) => void;
};

export function PokemonGridDesktop({ onPokemonSelect }: Props) {
  const [page, setPage] = useState(0);
  const pageSize = 30;

  const { data, isError, isLoading } = usePokemonPage(page, pageSize);

  if (isError) return <p className="text-red-600">Failed to load.</p>;

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {Array.from({ length: pageSize }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-square bg-slate-200 rounded mb-2" />
            <div className="h-4 bg-slate-200 rounded mb-1" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const totalCount = data && "count" in data ? data.count : 0;
  const hasNext = data && "next" in data ? !!data.next : false;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {data?.items.map((p) => (
          <PokemonCard
            key={p.id}
            id={p.id}
            name={p.name}
            img={p.img}
            onOpen={onPokemonSelect}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          className="btn"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Prev
        </button>
        <span className="text-sm text-slate-600">Total: {totalCount}</span>
        <button
          className="btn"
          disabled={!hasNext}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
