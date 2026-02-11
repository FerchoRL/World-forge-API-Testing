import { When, Then, AfterAll } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";
import {
  disposeCharacterContext,
} from "../character.context";
import type { GetCharacterByIdResponse } from "../character.api";
import { VALID_STATUSES } from "../../../utils/domain/status";
import { ctx } from "../character.common.steps";
import { findCharacterById } from "../../../utils/db/repositories/character.db.repository";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";

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
    expect(typeof category).toBe("string");
    expect(category.length).toBeGreaterThan(0);
    // Aquí mañana puedes validar contra CATEGORIES real
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

Then("the response should match the character stored in the database", async () => {
  const apiCharacter = responseBodyGetById.character;

  const dbCharacter = await findCharacterById(apiCharacter.id);

  expect(dbCharacter).not.toBeNull();  // validación explícita

  if (!dbCharacter) {
    throw new Error(`Character ${apiCharacter.id} not found in database`);
  }

  expect(apiCharacter.id).toBe(dbCharacter._id);
  expect(apiCharacter.name).toBe(dbCharacter.name);
  expect(apiCharacter.status).toBe(dbCharacter.status);
});




AfterAll(async () => {
  await disposeCharacterContext(ctx);
  await closeDatabase();
});
