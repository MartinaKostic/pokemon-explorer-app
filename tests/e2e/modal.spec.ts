import { test, expect } from "@playwright/test";

async function mockPokemonListAndDetails(page) {
  // Pretend the grid asks for 30 Pokemon, I give it back Bulbasaur and Ivysaur
  await page.route("**/api/v2/pokemon?*", async (route) => {
    const url = new URL(route.request().url());
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");
    if (limit === "30" && offset === "0") {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          count: 2,
          next: null,
          previous: null,
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
          ],
        }),
      });
    }
    return route.continue();
  });

  // When the modal asks for Bulbasaur details, I give it back this data
  await page.route("**/api/v2/pokemon/1", async (route) => {
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        name: "bulbasaur",
        types: [
          {
            slot: 1,
            type: { name: "grass", url: "https://pokeapi.co/api/v2/type/12/" },
          },
          {
            slot: 2,
            type: { name: "poison", url: "https://pokeapi.co/api/v2/type/4/" },
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
      }),
    });
  });
}

test("open modal from grid, see details, then close", async ({ page }) => {
  await mockPokemonListAndDetails(page);

  await page.goto("/");

  // Wait for Bulbasaur card to show up
  const cardButton = page.getByRole("button", { name: /bulbasaur-1/i });
  await expect(cardButton).toBeVisible();

  // Open the modal
  await cardButton.click();

  // Wait for the modal to show up
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Bulbasaur details in the modal
  await expect(page.getByRole("heading", { name: /bulbasaur/i })).toBeVisible();

  await page.getByRole("button", { name: /close modal/i }).click();

  await expect(dialog).toBeHidden();
});
