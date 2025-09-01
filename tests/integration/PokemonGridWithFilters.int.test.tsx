import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../setup/server";
import { PokemonGridWithFilters } from "../../src/components/PokemonGridWithFilters";
import { DEFAULT_FILTERS, DEFAULT_SORT } from "../../src/utils/filters";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../src/api/queryClient";

// Pretend we're on desktop (not mobile) so the UI is simpler in tests
vi.mock("../../src/hooks/useIsMobile", () => ({ useIsMobile: () => false }));

// Example pokemon data we return from the fake API
const charmander = {
  id: 4,
  name: "charmander",
  types: [
    {
      slot: 1,
      type: { name: "fire", url: "https://pokeapi.co/api/v2/type/10/" },
    },
  ],
  stats: [
    { base_stat: 39, stat: { name: "hp" } },
    { base_stat: 52, stat: { name: "attack" } },
    { base_stat: 43, stat: { name: "defense" } },
    { base_stat: 65, stat: { name: "speed" } },
  ],
  abilities: [
    {
      ability: { name: "blaze", url: "https://pokeapi.co/api/v2/ability/66/" },
      is_hidden: false,
    },
  ],
  species: {
    name: "charmander",
    url: "https://pokeapi.co/api/v2/pokemon-species/4/",
  },
};

const charmeleon = {
  id: 5,
  name: "charmeleon",
  types: [
    {
      slot: 1,
      type: { name: "fire", url: "https://pokeapi.co/api/v2/type/10/" },
    },
  ],
  stats: [
    { base_stat: 58, stat: { name: "hp" } },
    { base_stat: 64, stat: { name: "attack" } },
    { base_stat: 58, stat: { name: "defense" } },
    { base_stat: 80, stat: { name: "speed" } },
  ],
  abilities: [
    {
      ability: { name: "blaze", url: "https://pokeapi.co/api/v2/ability/66/" },
      is_hidden: false,
    },
  ],
  species: {
    name: "charmeleon",
    url: "https://pokeapi.co/api/v2/pokemon-species/5/",
  },
};

describe("PokemonGridWithFilters (integration)", () => {
  it("shows fire type results after loading", async () => {
    server.use(
      http.get("https://pokeapi.co/api/v2/type/fire", () =>
        HttpResponse.json({
          pokemon: [
            { pokemon: { url: "https://pokeapi.co/api/v2/pokemon/4/" } },
            { pokemon: { url: "https://pokeapi.co/api/v2/pokemon/5/" } },
          ],
        })
      ),
      http.get("https://pokeapi.co/api/v2/pokemon/4", () =>
        HttpResponse.json(charmander)
      ),
      http.get("https://pokeapi.co/api/v2/pokemon/5", () =>
        HttpResponse.json(charmeleon)
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <PokemonGridWithFilters
          filters={{
            ...DEFAULT_FILTERS,
            types: ["fire"],
            typeMatchMode: "any",
          }}
          sortOption={DEFAULT_SORT}
          searchTerm=""
          onClearFilters={() => {}}
        />
      </QueryClientProvider>
    );

    await screen.findByText(/charmander/i);
    await screen.findByText(/charmeleon/i);

    await waitFor(() => {
      expect(screen.queryByText(/Loading Pokemon/i)).toBeNull();
    });
  });

  it("filters by search text (name contains)", async () => {
    server.use(
      http.get("https://pokeapi.co/api/v2/pokemon", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("limit") === "1500") {
          return HttpResponse.json({
            count: 2,
            results: [
              {
                name: "bulbasaur",
                url: "https://pokeapi.co/api/v2/pokemon/1/",
              },
              {
                name: "caterpie",
                url: "https://pokeapi.co/api/v2/pokemon/10/",
              },
            ],
          });
        }
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get("https://pokeapi.co/api/v2/pokemon/1", () =>
        HttpResponse.json({
          id: 1,
          name: "bulbasaur",
          types: [
            {
              slot: 1,
              type: {
                name: "grass",
                url: "https://pokeapi.co/api/v2/type/12/",
              },
            },
          ],
          stats: [
            { base_stat: 45, stat: { name: "hp" } },
            { base_stat: 49, stat: { name: "attack" } },
            { base_stat: 49, stat: { name: "defense" } },
            { base_stat: 45, stat: { name: "speed" } },
          ],
          abilities: [
            {
              ability: {
                name: "overgrow",
                url: "https://pokeapi.co/api/v2/ability/65/",
              },
              is_hidden: false,
            },
          ],
          species: {
            name: "bulbasaur",
            url: "https://pokeapi.co/api/v2/pokemon-species/1/",
          },
        })
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <PokemonGridWithFilters
          filters={DEFAULT_FILTERS}
          sortOption={DEFAULT_SORT}
          searchTerm="bulb"
          onClearFilters={() => {}}
        />
      </QueryClientProvider>
    );

    await screen.findByText(/bulbasaur/i);
    expect(screen.queryByText(/caterpie/i)).toBeNull();
  });
});
