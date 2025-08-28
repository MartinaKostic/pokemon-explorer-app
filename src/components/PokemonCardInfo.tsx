import { TYPE_COLORS } from "../utils/pokemon";
import { usePokemonDetails } from "../api/usePokemonDetails";

type Props = {
  id: number;
  types?: string[];
  stats?: { hp: number; attack: number; defense: number };
};

export function PokemonCardInfo({
  id,
  types: preTypes,
  stats: preStats,
}: Props) {
  const shouldFetch = !preTypes || !preStats;
  const { data } = usePokemonDetails(shouldFetch ? id : undefined);

  if (!preTypes && !preStats && !data) {
    return (
      <div className="mt-1 space-y-1">
        <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
        <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const types = preTypes ?? data?.types.map((t) => t.type.name) ?? [];
  const get = (n: string) => {
    if (preStats) {
      if (n === "hp") return preStats.hp;
      if (n === "attack") return preStats.attack;
      if (n === "defense") return preStats.defense;
    }
    return data?.stats.find((s) => s.stat.name === n)?.base_stat ?? 0;
  };

  return (
    <div className="mt-1 space-y-1">
      <div className="flex gap-1">
        {types.map((t) => (
          <span
            key={t}
            className={`px-2 py-0.5 rounded text-xs font-medium capitalize text-white ${TYPE_COLORS[t] ?? "bg-slate-400"}`}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="text-xs text-slate-600 flex gap-3">
        <span>HP {get("hp")}</span>
        <span>ATK {get("attack")}</span>
        <span>DEF {get("defense")}</span>
      </div>
    </div>
  );
}
