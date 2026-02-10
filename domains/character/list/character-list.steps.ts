import { Given, When, Then, AfterAll } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";
import {
  createCharacterContext,
  disposeCharacterContext,
  type CharacterContext,
} from "../character.context";
import type { ListCharactersResponse } from "../character.api";

let ctx: CharacterContext;
let response: APIResponse;
let responseBody: ListCharactersResponse;

Given("the Character service is available", async () => {
  // En API testing esto es “setup”: creamos el contexto para usar el servicio
  ctx = await createCharacterContext();
});

When(
  "I request the list of characters without pagination parameters",
  async () => {
    response = await ctx.characterApi.listCharacters();
    responseBody = (await response.json()) as ListCharactersResponse;
  },
);

When(
  "I request the list of characters with page {int} and limit {int}",
  async (page: number, limit: number) => {
    response = await ctx.characterApi.listCharacters({ page, limit });
    responseBody = (await response.json()) as ListCharactersResponse;
  },
);

When(
  "I request the list of characters with limit {word}",
  async (limit: string) => {
    response = await ctx.characterApi.listCharacters({ limit });
    responseBody = (await response.json()) as ListCharactersResponse;
  },
);

When(
  "I request the list of characters with page {word}",
  async (page: string) => {
    response = await ctx.characterApi.listCharacters({ page });
    responseBody = (await response.json()) as ListCharactersResponse;
  },
);

When(
  "I request the list of characters with unknown query parameters",
  async () => {
    response = await ctx.characterApi.listCharacters({
      // estos params NO existen en el contrato
      // los pasamos como any para simular query real
      // sin tocar el API client
    } as any);

    // forzamos la URL manualmente
    response = await ctx.apiContext.get("/characters?limite=6&pagina=2");
    responseBody = (await response.json()) as ListCharactersResponse;
  },
);

When(
  "I request the list of characters and an internal error occurs",
  async () => {
    // Request directo para este caso de error
    response = await ctx.apiContext.get("/characters");
  },
);

Then(
  "the response should contain the default pagination values for character list",
  async () => {
    expect(response.status()).toBe(200);

    expect(responseBody.page).toBe(1);
    expect(responseBody.limit).toBe(10);

    expect(Array.isArray(responseBody.characters)).toBe(true);
    expect(typeof responseBody.total).toBe("number");
  },
);

Then(
  "the response should respect the pagination values page {int} and limit {int}",
  async (expectedPage: number, expectedLimit: number) => {
    expect(response.status()).toBe(200);

    expect(responseBody.page).toBe(expectedPage);
    expect(responseBody.limit).toBe(expectedLimit);

    expect(Array.isArray(responseBody.characters)).toBe(true);
    expect(responseBody.characters.length).toBeLessThanOrEqual(expectedLimit);

    expect(typeof responseBody.total).toBe("number");
  },
);

Then("the response should apply limit {int}", async (expectedLimit: number) => {
  expect(response.status()).toBe(200);

  expect(responseBody.page).toBe(1);
  expect(responseBody.limit).toBe(expectedLimit);

  expect(Array.isArray(responseBody.characters)).toBe(true);
  expect(responseBody.characters.length).toBeLessThanOrEqual(expectedLimit);

  expect(typeof responseBody.total).toBe("number");
});

Then("the response should default the page to 1", async () => {
  expect(response.status()).toBe(200);

  expect(responseBody.page).toBe(1);
  expect(responseBody.limit).toBe(10);

  expect(Array.isArray(responseBody.characters)).toBe(true);
  expect(typeof responseBody.total).toBe("number");
});

Then(
  "the response should return an empty character list for page {int}",
  async (expectedPage: number) => {
    expect(response.status()).toBe(200);

    expect(responseBody.page).toBe(expectedPage);
    expect(responseBody.limit).toBe(10);

    expect(Array.isArray(responseBody.characters)).toBe(true);
    expect(responseBody.characters.length).toBe(0);

    expect(typeof responseBody.total).toBe("number");
  },
);

Then("the response should ignore unknown query parameters", async () => {
  expect(response.status()).toBe(200);

  expect(responseBody.page).toBe(1);
  expect(responseBody.limit).toBe(10);

  expect(Array.isArray(responseBody.characters)).toBe(true);
  expect(typeof responseBody.total).toBe("number");
});

Then("the response should return a 500 internal server error", async () => {
  expect(response.status()).toBe(500);
  const body = await response.json();
  expect(body).toBeDefined();
});

Then(
  "each returned character should match the CharacterDTO contract",
  async () => {
    expect(response.status()).toBe(200);

    // sanity del envelope
    expect(Array.isArray(responseBody.characters)).toBe(true);
    expect(typeof responseBody.page).toBe("number");
    expect(typeof responseBody.limit).toBe("number");
    expect(typeof responseBody.total).toBe("number");

    for (const character of responseBody.characters) {
      expect(character).toBeTruthy();
      expect(typeof character).toBe("object");

      const c = character as any;

      // required fields
      expect(typeof c.id).toBe("string");
      expect(typeof c.name).toBe("string");
      expect(typeof c.status).toBe("string");

      expect(Array.isArray(c.categories)).toBe(true);
      for (const cat of c.categories) {
        expect(typeof cat).toBe("string");
      }

      expect(typeof c.identity).toBe("string");

      expect(Array.isArray(c.inspirations)).toBe(true);
      for (const insp of c.inspirations) {
        expect(typeof insp).toBe("string");
      }

      // optional field
      if (c.notes !== undefined) {
        expect(typeof c.notes).toBe("string");
      }
    }
  },
);

AfterAll(async () => {
  await disposeCharacterContext(ctx);
});
