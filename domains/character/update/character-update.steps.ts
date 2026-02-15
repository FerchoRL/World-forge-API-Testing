import { When, Then, AfterAll } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../character.common.steps";
import { disposeCharacterContext } from "../character.context";

import type { CharacterDTO, GetCharacterByIdResponse } from "../character.api";
import type { CharacterModel } from "../character.model";

import { createCharacterWithValidPayload } from "../character.test-helpers";
import { generateWaifuName } from "../character-name.generator";
import { VALID_CATEGORIES } from "../character.types";

import {
  mapApiToCharacterModel,
  mapMongoToCharacterModel,
} from "../character.mapper";

import { findCharacterById } from "../../../utils/db/repositories/character.db.repository";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { buildInvalidCharacterPayload, buildValidCharacterPayload } from "../create/character-create.payload";

let response: APIResponse;
let responseBody: GetCharacterByIdResponse;
let updatePayload: Partial<Omit<CharacterDTO, "id">>;
let existingCharacterId: string;
let updatedCharacterModel: CharacterModel;

/**
 * STEPS – UPDATE CHARACTER
 */

// ==========================================
// WHEN STEPS - Successful Updates
// ==========================================

When("I update an existing character with multiple valid fields", async () => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Actualizar múltiples campos
  updatePayload = {
    name: generateWaifuName(),
    identity: "Updated Identity Description",
    notes: "Updated notes content",
  };
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
  
  responseBody = (await response.json()) as GetCharacterByIdResponse;
  
  updatedCharacterModel = mapApiToCharacterModel(responseBody.character);
});

When("I update an existing character with valid categories", async () => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Actualizar categories - usar categorías válidas del enum sin hardcodear
  const validCategories = [VALID_CATEGORIES[0], VALID_CATEGORIES[1]] as any[];
  updatePayload = {
    categories: validCategories,
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
  
  responseBody = (await response.json()) as GetCharacterByIdResponse;
  
  updatedCharacterModel = mapApiToCharacterModel(responseBody.character);
});

When("I update an existing character with valid inspirations", async () => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Actualizar inspirations - generar dinámicamente con timestamp para unicidad
  const timestamp = Date.now();
  updatePayload = {
    inspirations: [`Updated Inspiration ${timestamp}-1`, `Updated Inspiration ${timestamp}-2`],
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
  
  responseBody = (await response.json()) as GetCharacterByIdResponse;
  
  updatedCharacterModel = mapApiToCharacterModel(responseBody.character);
});

// ==========================================
// WHEN STEPS - Error Scenarios
// ==========================================

When("I attempt to update a character without providing an ID", async () => {
  // Llamar a PATCH /characters/ sin ID (enviar string vacía)
  updatePayload = {
    name: generateWaifuName(),
  };
  response = await ctx.characterApi.updateCharacter("", updatePayload);
});

When("I attempt to update a character with a non-existent ID", async () => {
  // Usar un ID que no existe en el sistema
  const nonExistentId = "char_nonexistent_" + Date.now();
  updatePayload = {
    name: generateWaifuName(),
  };
  response = await ctx.characterApi.updateCharacter(nonExistentId, updatePayload);
});

When("I attempt to update a character with an unsupported field status", async () => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Intentar actualizar con el campo status (no soportado)
  updatePayload = {
    status: "ACTIVE" as any, // Campo prohibido en PATCH
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

When("I update a character with invalid name type {word}", async (type: string) => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Reutilizar la lógica de buildInvalidCharacterPayload del CREATE
  const invalidPayload = buildInvalidCharacterPayload("name", type) as any;
  
  // Para UPDATE (PATCH), extraer solo el campo name del payload inválido
  // No enviamos todos los campos, solo el que queremos probar
  updatePayload = {
    name: invalidPayload.name,
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

When("I update a character with invalid identity type {word}", async (type: string) => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Reutilizar la lógica de buildInvalidCharacterPayload del CREATE
  const invalidPayload = buildInvalidCharacterPayload("identity", type) as any;
  
  // Para UPDATE (PATCH), extraer solo el campo identity del payload inválido
  updatePayload = {
    identity: invalidPayload.identity,
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

When("I update a character with invalid categories type {word}", async (type: string) => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Reutilizar la lógica de buildInvalidCharacterPayload del CREATE
  const invalidPayload = buildInvalidCharacterPayload("categories", type) as any;
  
  // Para UPDATE (PATCH), extraer solo el campo categories del payload inválido
  updatePayload = {
    categories: invalidPayload.categories,
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

When("I update a character with invalid category value {string}", async (category: string) => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Construir payload con categoría inválida (no existe en el enum)
  updatePayload = {
    categories: [category as any],
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

When("I update a character with duplicated categories", async () => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Generar categorías duplicadas usando la misma lógica del CREATE
  const validPayload = buildValidCharacterPayload();
  const duplicatedCategory = validPayload.categories[0];

  updatePayload = {
    categories: [duplicatedCategory, duplicatedCategory],
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

When("I update a character with invalid inspirations type {string}", async (type: string) => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Reutilizar la lógica de buildInvalidCharacterPayload del CREATE
  const invalidPayload = buildInvalidCharacterPayload("inspirations", type) as any;
  
  // Para UPDATE (PATCH), extraer solo el campo inspirations del payload inválido
  updatePayload = {
    inspirations: invalidPayload.inspirations,
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

When("I update a character with invalid inspiration item {string}", async (rawValue: string) => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Convertir el valor según el tipo (igual que en CREATE)
  let value: any;
  
  if (rawValue === "true") value = true;
  else if (rawValue === "false") value = false;
  else if (!isNaN(Number(rawValue)) && rawValue.trim() !== "") {
    value = Number(rawValue);
  } else {
    value = rawValue; // Mantener como string para "" y "   "
  }

  // Para UPDATE (PATCH), solo enviar el campo inspirations con el item inválido
  updatePayload = {
    inspirations: [value],
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

When("I update a character with invalid notes type {string}", async (type: string) => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Reutilizar la lógica de buildInvalidCharacterPayload del CREATE
  const invalidPayload = buildInvalidCharacterPayload("notes", type) as any;
  
  // Para UPDATE (PATCH), extraer solo el campo notes del payload inválido
  updatePayload = {
    notes: invalidPayload.notes,
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});
When("I attempt to update a character with an already existing name", async () => {
  // Crear primer character con nombre específico
  const firstCharacterName = `Character-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const firstPayload = buildValidCharacterPayload({ name: firstCharacterName });
  const firstResponse = await ctx.characterApi.createCharacter(firstPayload);
  const firstCharacterBody = (await firstResponse.json()) as CharacterDTO;
  const firstCharacterId = firstCharacterBody.id;

  // Crear segundo character que intentaremos actualizar
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Intentar actualizar el segundo character con el nombre del primero
  updatePayload = {
    name: firstCharacterName,
  };
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});
When("I update a character with an empty body", async () => {
  // Crear character usando helper reutilizable
  existingCharacterId = await createCharacterWithValidPayload(ctx.characterApi);

  // Enviar body completamente vacío
  updatePayload = {};
  
  response = await ctx.characterApi.updateCharacter(existingCharacterId, updatePayload);
});

// ==========================================
// THEN STEPS - Success Validations
// ==========================================

Then("the character update should be successful", async () => {
  expect(response.status()).toBe(200);
  expect(responseBody).toBeDefined();
  expect(responseBody.character).toBeDefined();
  expect(responseBody.character.id).toBeDefined();
});

Then("the updated character should reflect the changes from the update payload", async () => {
  // Validate each field in updatePayload matches the response
  for (const [field, expectedValue] of Object.entries(updatePayload)) {
    const actualValue = responseBody.character[field as keyof CharacterDTO];
    expect(actualValue).toEqual(expectedValue);
  }
});

Then("the updated character should be stored in the database", async function () {
  const dbCharacter = await findCharacterById(existingCharacterId);

  expect(dbCharacter).not.toBeNull();

  if (!dbCharacter) {
    throw new Error(`Character ${existingCharacterId} not found in database`);
  }

  const dbModel = mapMongoToCharacterModel(dbCharacter);

  await this.attach(
    JSON.stringify(
      {
        updatedCharacterModel,
        dbModel,
      },
      null,
      2
    ),
    "application/json"
  );

  expect(updatedCharacterModel).toEqual(dbModel);
});

// ==========================================
// THEN STEPS - Error Validations
// ==========================================

Then("the character update should fail with status {int}", async (expectedStatus: number) => {
  expect(response.status()).toBe(expectedStatus);
});

Then("the updated character error message should be {string}", async function (expectedMessage: string) {
  const body = await response.json();

  await this.attach(
    JSON.stringify(
      {
        requestPayload: updatePayload,
        responseStatus: response.status(),
        responseBody: body,
      },
      null,
      2
    ),
    "application/json"
  );

  expect(body).toEqual({
    error: expectedMessage,
  });
});

// ==========================================
// CLEANUP
// ==========================================

AfterAll(async () => {
  await disposeCharacterContext(ctx);
  await closeDatabase();
});
