import { describe, it, expect } from "vitest";
import {
  POKEMON_TYPES,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  STAT_KEYS,
  filtersToURLParams,
  urlParamsToFilters,
  hasActiveFilters,
  unionSets,
  intersectTwo,
  intersectAll,
} from "../../src/utils/filters";

describe("utils/filters constants", () => {
  it("POKEMON_TYPES is non-empty, lowercase, and unique", () => {
    expect(Array.isArray(POKEMON_TYPES)).toBe(true);
    expect(POKEMON_TYPES.length).toBeGreaterThan(0);
    expect(POKEMON_TYPES.every((t) => t === t.toLowerCase())).toBe(true);
    expect(new Set(POKEMON_TYPES).size).toBe(POKEMON_TYPES.length);
  });

  it("DEFAULT_FILTERS and DEFAULT_SORT basic shape", () => {
    expect(DEFAULT_FILTERS).toBeDefined();
    expect(DEFAULT_FILTERS).toHaveProperty("types");
    expect(DEFAULT_FILTERS).toHaveProperty("typeMatchMode");
    expect(DEFAULT_FILTERS).toHaveProperty("generations");
    expect(DEFAULT_FILTERS).toHaveProperty("stats");
    expect(DEFAULT_FILTERS.stats).toHaveProperty("hp");
    expect(DEFAULT_SORT).toEqual({ field: "none", direction: "asc" });
  });

  it("STAT_KEYS matches DEFAULT_FILTERS.stats keys", () => {
    expect(new Set(STAT_KEYS)).toEqual(
      new Set(Object.keys(DEFAULT_FILTERS.stats))
    );
  });
});

describe("utils/filters url param helpers", () => {
  it("filtersToURLParams adds our changes to the URL", () => {
    const params = filtersToURLParams({
      ...DEFAULT_FILTERS,
      types: ["fire", "water"],
      typeMatchMode: "all",
      generations: [1, 3, 9],
      stats: { ...DEFAULT_FILTERS.stats, attack: [30, 200] },
      abilities: ["overgrow", "blaze"],
    });

    const p = Object.fromEntries(params.entries());
    expect(p.types).toBe("fire,water");
    expect(p.typeMatchMode).toBe("all");
    expect(p.generations).toBe("1,3,9");
    expect(p.attack_min).toBe("30");
    expect(p.attack_max).toBe("200");
    expect(p.abilities).toBe("overgrow,blaze");

    // hp wasn't changed, so it's not in the URL
    expect(p.hp_min).toBeUndefined();
    expect(p.hp_max).toBeUndefined();
  });

  it("urlParamsToFilters reads values and keeps them in range", () => {
    const params = new URLSearchParams({
      types: "fire,unknown,water",
      typeMatchMode: "all",
      generations: "0,1,10,3,9",
      hp_min: "0",
      hp_max: "999",
      speed_min: "50",
      speed_max: "200",
      abilities: "overgrow,custom-ability",
    });

    const f = urlParamsToFilters(params);
    expect(f.types).toEqual(["fire", "water"]); // filters out unknown
    expect(f.typeMatchMode).toBe("all");
    expect(f.generations).toEqual([1, 3, 9]); // clamps to 1-9
    expect(f.stats.hp).toEqual([1, 255]); // clamped from 0-999
    expect(f.stats.speed).toEqual([50, 200]);
    expect(f.abilities).toEqual(["overgrow", "custom-ability"]);
  });

  it("hasActiveFilters is true when filters are changed", () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);

    const withType = { ...DEFAULT_FILTERS, types: ["fire"] };
    expect(hasActiveFilters(withType)).toBe(true);

    const withGen = { ...DEFAULT_FILTERS, generations: [1] };
    expect(hasActiveFilters(withGen)).toBe(true);

    const withStats = {
      ...DEFAULT_FILTERS,
      stats: { ...DEFAULT_FILTERS.stats, attack: [2, 255] as [number, number] },
    };
    expect(hasActiveFilters(withStats)).toBe(true);

    const withAbilities = { ...DEFAULT_FILTERS, abilities: ["overgrow"] };
    expect(hasActiveFilters(withAbilities)).toBe(true);
  });
});

describe("utils/filters set helpers", () => {
  it("unionSets merges ids without duplicates", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([3, 4]);
    const c = new Set<number>();
    expect(Array.from(unionSets([a, b, c])).sort((x, y) => x - y)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("intersectTwo returns only shared ids", () => {
    const a = new Set([1, 2, 3, 4]);
    const b = new Set([3, 4, 5]);
    expect(Array.from(intersectTwo(a, b)).sort((x, y) => x - y)).toEqual([
      3, 4,
    ]);
  });

  it("intersectAll works with empty and multiple sets", () => {
    expect(intersectAll([])).toEqual(new Set());
    const a = new Set([1, 2, 3]);
    const b = new Set([2, 3, 4]);
    const c = new Set([3, 4, 5]);
    expect(Array.from(intersectAll([a, b, c])).sort((x, y) => x - y)).toEqual([
      3,
    ]);
  });
});
