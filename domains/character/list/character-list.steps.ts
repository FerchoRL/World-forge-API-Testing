import { When, Then, AfterAll } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";
import {
  disposeCharacterContext,
} from "../character.context";
import type { CharacterDTO, ListCharactersResponse } from "../character.api";
import { ctx } from "../character.common.steps";
import { expectInternalServerError } from "../../../utils/assertions";
import { VALID_STATUSES } from "../../../contracts/common/status";
import { VALID_CATEGORIES } from "../character.types";

let response: APIResponse;
let responseBodyList: ListCharactersResponse;

/**
 * STEPS DE LISTADO DE PERSONAJES
 * 
 * Estos steps cubren el endpoint GET /characters, incluyendo casos de paginación,
 * manejo de parámetros inválidos, y validación del contrato de respuesta.
 */
When("I request the list of characters without pagination parameters", async () => {
  response = await ctx.characterApi.listCharacters();
  responseBodyList = (await response.json()) as ListCharactersResponse;
});

When("I request the list of characters with page {int} and limit {int}", async (page: number, limit: number) => {
  response = await ctx.characterApi.listCharacters({ page, limit });
  responseBodyList = (await response.json()) as ListCharactersResponse;
});

When(/^I request the list of characters with limit (\S+)$/, async (limit: string) => {
  // Intentar parsear como número, si falla enviarlo como string
  const parsedLimit = !isNaN(Number(limit)) ? Number(limit) : limit;
  response = await ctx.characterApi.listCharacters({ limit: parsedLimit });
  responseBodyList = (await response.json()) as ListCharactersResponse;
});

When(/^I request the list of characters with page (\S+)$/, async (page: string) => {
  // Intentar parsear como número, si falla enviarlo como string
  const parsedPage = !isNaN(Number(page)) ? Number(page) : page;
  response = await ctx.characterApi.listCharacters({ page: parsedPage });
  responseBodyList = (await response.json()) as ListCharactersResponse;
});

When("I request the list of characters with unknown query parameters", async () => {
  // Enviamos parámetros que NO existen en el contrato: "limite" y "pagina"
  // en lugar de "limit" y "page"
  response = await ctx.apiContext.get("/characters?limite=6&pagina=2");
  responseBodyList = (await response.json()) as ListCharactersResponse;
});

When("I request the list of characters and an internal error occurs", async () => {
  // Request directo para este caso de error
  response = await ctx.apiContext.get("/characters");
});

/**
 * VALIDACIONES DE RESPUESTA - PAGINACIÓN Y CONTRATO
 */
Then("the response should contain the default pagination values for character list", async () => {
  expect(response.status()).toBe(200);

  expect(responseBodyList.page).toBe(1);
  expect(responseBodyList.limit).toBe(10);

  expect(Array.isArray(responseBodyList.characters)).toBe(true);
  expect(typeof responseBodyList.total).toBe("number");
});

Then("the response should respect the pagination values page {int} and limit {int}", async (expectedPage: number, expectedLimit: number) => {
  expect(response.status()).toBe(200);

  expect(responseBodyList.page).toBe(expectedPage);
  expect(responseBodyList.limit).toBe(expectedLimit);

  expect(Array.isArray(responseBodyList.characters)).toBe(true);
  expect(responseBodyList.characters.length).toBeLessThanOrEqual(expectedLimit);

  expect(typeof responseBodyList.total).toBe("number");
});

Then("the response should apply limit {int}", async (expectedLimit: number) => {
  expect(response.status()).toBe(200);

  expect(responseBodyList.page).toBe(1);
  expect(responseBodyList.limit).toBe(expectedLimit);

  expect(Array.isArray(responseBodyList.characters)).toBe(true);
  expect(responseBodyList.characters.length).toBeLessThanOrEqual(expectedLimit);

  expect(typeof responseBodyList.total).toBe("number");
});

Then("the response should cap the limit to {int}", async (cappedLimit: number) => {
  expect(response.status()).toBe(200);

  expect(responseBodyList.page).toBe(1);
  expect(responseBodyList.limit).toBe(cappedLimit);

  expect(Array.isArray(responseBodyList.characters)).toBe(true);
  expect(responseBodyList.characters.length).toBeLessThanOrEqual(cappedLimit);

  expect(typeof responseBodyList.total).toBe("number");
});

Then("the response should return an empty character list for page {int}", async (expectedPage: number) => {
  expect(response.status()).toBe(200);

  expect(responseBodyList.page).toBe(expectedPage);
  expect(responseBodyList.limit).toBe(10);

  expect(Array.isArray(responseBodyList.characters)).toBe(true);
  expect(responseBodyList.characters.length).toBe(0);

  expect(typeof responseBodyList.total).toBe("number");
});

Then("the response should ignore unknown query parameters", async () => {
  expect(response.status()).toBe(200);

  expect(responseBodyList.page).toBe(1);
  expect(responseBodyList.limit).toBe(10);

  expect(Array.isArray(responseBodyList.characters)).toBe(true);
  expect(typeof responseBodyList.total).toBe("number");
});

/**
 * VALIDACIONES DE ERRORES 400 - PARÁMETROS INVÁLIDOS
 */
Then("the response should return a 400 error with message {string}", async function (expectedMessage: string) {
  expect(response.status()).toBe(400);
  
  const errorBody = await response.json();
  
  await this.attach(
    JSON.stringify(
      {
        requestUrl: response.url(),
        responseStatus: response.status(),
        responseBody: errorBody,
        expectedMessage: expectedMessage,
      },
      null,
      2
    ),
    "application/json"
  );
  
  expect(errorBody).toHaveProperty("error");
  expect(errorBody.error).toBe(expectedMessage);
});

Then("the response should return a 500 internal server error", async () => {
  await expectInternalServerError(response);
});

Then("each returned character should match the CharacterDTO contract", async () => {
  expect(response.status()).toBe(200);

  // sanity del envelope
  expect(Array.isArray(responseBodyList.characters)).toBe(true);
  expect(typeof responseBodyList.page).toBe("number");
  expect(typeof responseBodyList.limit).toBe("number");
  expect(typeof responseBodyList.total).toBe("number");

  for (const c of responseBodyList.characters) {

    // required fields
    expect(typeof c.id).toBe("string");
    expect(typeof c.name).toBe("string");

    // Validate Status against contract
    expect(VALID_STATUSES).toContain(c.status);

    // Categories must be valid CategoryName
    expect(Array.isArray(c.categories)).toBe(true);
    for (const cat of c.categories) {
      expect(VALID_CATEGORIES).toContain(cat);
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
});

AfterAll(async () => {
  await disposeCharacterContext(ctx);
});
