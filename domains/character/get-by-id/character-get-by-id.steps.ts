import { When, Then, AfterAll } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";
import {
  disposeCharacterContext,
} from "../character.context";
import type { GetCharacterByIdResponse } from "../character.api";
import { VALID_STATUSES } from "../../../contracts/common/status";
import { ctx } from "../character.common.steps";
import { findCharacterById } from "../../../utils/db/repositories/character.db.repository";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { mapApiToCharacterModel, mapMongoToCharacterModel } from "../character.mapper";
import { VALID_CATEGORIES } from "../character.types";

let response: APIResponse;
let responseBodyGetById: GetCharacterByIdResponse;

// Steps para GET /characters/{id}
When("I request the character by id {word}", async (id: string) => {
  response = await ctx.characterApi.getCharacterById(id);
  responseBodyGetById = (await response.json()) as GetCharacterByIdResponse;
});

When("I request the character by id {word} and an internal error occurs", async (id: string) => {
  // TODO:
  // When backend supports forcing internal errors (via header or env),
  // this request should include that trigger.
  response = await ctx.characterApi.getCharacterById(id);
});

// Validaciones para GET /characters/{id}
Then("the response should return a 500 internal server error", async () => {
  expect(response.status()).toBe(500);
  const body = await response.json();
  expect(body).toBeDefined();
});

Then("the response status should be {int}", async (status: number) => {
  expect(response.status()).toBe(status);
});

Then("the response should contain a character", async () => {
  expect(responseBodyGetById.character).toBeDefined();
});

Then("the character should have a valid id", async () => {
  expect(typeof responseBodyGetById.character.id).toBe("string");
  expect(responseBodyGetById.character.id.length).toBeGreaterThan(0);
});

Then("the character should have a name", async () => {
  expect(typeof responseBodyGetById.character.name).toBe("string");
  expect(responseBodyGetById.character.name.length).toBeGreaterThan(0);
});

Then("the character should have a valid status", async () => {
  expect(VALID_STATUSES).toContain(responseBodyGetById.character.status);
});

Then("the character should have categories", async () => {
  expect(Array.isArray(responseBodyGetById.character.categories)).toBe(true);
});

Then("each category should be valid", async () => {
  for (const category of responseBodyGetById.character.categories) {
    for (const category of responseBodyGetById.character.categories) {
      expect(VALID_CATEGORIES).toContain(category);
    }
  }
});

Then("the character should have an identity", async () => {
  expect(typeof responseBodyGetById.character.identity).toBe("string");
  expect(responseBodyGetById.character.identity.length).toBeGreaterThan(0);
});

Then("the character should have inspirations", async () => {
  expect(Array.isArray(responseBodyGetById.character.inspirations)).toBe(true);
  expect(responseBodyGetById.character.inspirations.length).toBeGreaterThan(0);
  for (const insp of responseBodyGetById.character.inspirations) {
    expect(typeof insp).toBe("string");
    expect(insp.length).toBeGreaterThan(0);
  }
});

Then("the character notes should be valid if present", async () => {
  const notes = responseBodyGetById.character.notes;
  if (notes !== undefined) {
    expect(typeof notes).toBe("string");
  }
});

Then("the response should return a 400 validation error for id {word}", async (id: string) => {
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toContain(id);
});

Then("the response should match the character stored in the database", async function () {
  const apiCharacter = responseBodyGetById.character;

  const dbCharacter = await findCharacterById(apiCharacter.id);

  expect(dbCharacter).not.toBeNull();  // validación explícita

  if (!dbCharacter) {
    throw new Error(`Character ${apiCharacter.id} not found in database`);
  }

  const apiModel = mapApiToCharacterModel(apiCharacter);
  const dbModel = mapMongoToCharacterModel(dbCharacter);

  await this.attach(
    JSON.stringify(
      {
        apiModel,
        dbModel,
      },
      null,
      2
    ),
    "application/json"
  );

  /**
   * * 1️⃣ Validación estructural completa:
    *    expect(apiModel).toEqual(dbModel)
    *
    *    Beneficios:
    *    - Valida todo el objeto en una sola comparación.
    *    - Escala automáticamente si se agregan nuevos campos al modelo.
    *    - Mantiene el test limpio y desacoplado de DTO y Mongo.
    *    - Ideal como validación principal.
    *
   */

  expect(apiModel).toEqual(dbModel);

  /**
   * * 2️⃣ Validaciones campo por campo (opcional, para mayor claridad)
      * Beneficios:
      *    - Mensajes de error más granulares si algo falla.
      *    - Permite detectar exactamente qué propiedad divergió.
      *    - Útil durante refactors o debugging profundo.
   */

  // Core fields
  expect(apiCharacter.id).toBe(dbCharacter._id);
  expect(apiCharacter.name).toBe(dbCharacter.name);
  expect(apiCharacter.status).toBe(dbCharacter.status);
  expect(apiCharacter.identity).toBe(dbCharacter.identity);
  expect(apiCharacter.notes).toBe(dbCharacter.notes);

  // Arrays (orden importa si tu backend no reordena)
  expect(apiCharacter.categories).toEqual(dbCharacter.categories);
  expect(apiCharacter.inspirations).toEqual(dbCharacter.inspirations);
});




AfterAll(async () => {
  await disposeCharacterContext(ctx);
  await closeDatabase();
});
