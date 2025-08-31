import { useState } from "react";
import PokemonCard from "./PokemonCard";
import { usePokemonPage } from "../api/usePokemonList";
import { DESKTOP_PAGE_SIZE } from "../constants";
import { ErrorDisplay } from "./ErrorDisplay";

type Props = {
  onPokemonSelect?: (id: number) => void;
};

export function PokemonGridDesktop({ onPokemonSelect }: Props) {
  const [page, setPage] = useState(0);

  const { data, isError, isLoading, refetch } = usePokemonPage(
    page,
    DESKTOP_PAGE_SIZE
  );

  if (isError) {
    return (
      <ErrorDisplay
        message="Failed to load Pokemon. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {Array.from({ length: DESKTOP_PAGE_SIZE }).map((_, i) => (
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
    <div className="min-h-[50vh] flex flex-col">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6 flex-none">
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
        <span className="text-sm text-slate-600">
          Page {page + 1} /{" "}
          {Math.max(1, Math.ceil(totalCount / DESKTOP_PAGE_SIZE))}
        </span>
        <button
          className="btn"
          disabled={!hasNext}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
