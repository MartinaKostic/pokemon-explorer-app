import { useState } from "react";
import PokemonCard from "./PokemonCard";
import { usePokemonPage } from "../api/usePokemonList";

export function PokemonGridDesktop() {
  const [page, setPage] = useState(0);
  const pageSize = 30;
  const { data, isError } = usePokemonPage(page, pageSize);
  if (isError) return <p className="text-red-600">Failed to load.</p>;

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {data?.items.map((p) => (
          <PokemonCard key={p.id} id={p.id} name={p.name} img={p.img} />
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
        <span className="text-sm text-slate-600">Total: {data?.count}</span>
        <button
          className="btn"
          disabled={!data?.next}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
