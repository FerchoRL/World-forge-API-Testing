import { When, Then, AfterAll } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../character.common.steps";
import { disposeCharacterContext } from "../character.context";

import { type CharacterDTO, type CreateCharacterRequest, type CreateCharacterResponse, type GetCharacterByIdResponse } from "../character.api";
import type { CharacterModel } from "../character.model";
import { generateWaifuName } from "../character-name.generator";

import { buildValidCharacterPayload, buildInvalidCharacterPayload, buildCharacterWithoutNotes } from "./character-create.payload";

import {
  mapApiToCharacterModel,
  mapMongoToCharacterModel,
} from "../character.mapper";

import { findCharacterById } from "../../../utils/db/repositories/character.db.repository";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";

let response: APIResponse;
let responseBody: CharacterDTO;
let payload: CreateCharacterRequest;
let createdCharacterModel: CharacterModel;

let getByIdResponseBody: GetCharacterByIdResponse;
let getByIdCharacterModel: CharacterModel;

/**
 * STEPS – CREATE CHARACTER
 */

When("I create a character with a valid payload", async () => {
  payload = buildValidCharacterPayload();

  response = await ctx.characterApi.createCharacter(payload);

  responseBody = ((await response.json()) as CreateCharacterResponse).character;
  //Se mapea el responseBody a CharacterModel para usarlo en validaciones posteriores, como comparación con la base de datos o con la respuesta de get-by-id. Esto permite abstraer diferencias entre el formato API y el modelo de dominio.
  createdCharacterModel = mapApiToCharacterModel(responseBody);
});

When("I create a character without status", async () => {
  payload = buildValidCharacterPayload({ status: undefined });

  response = await ctx.characterApi.createCharacter(payload);
  responseBody = ((await response.json()) as CreateCharacterResponse).character;

  createdCharacterModel = mapApiToCharacterModel(responseBody);
});

When("I create a character with an invalid status", async () => {
  payload = buildInvalidCharacterPayload("status", "invalidEnum", {
    invalidValue: "ILLEGAL_STATUS",
  }) as any;
  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with invalid name type {word}", async (type: string) => {
  payload = buildInvalidCharacterPayload("name", type) as any;
  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with invalid identity type {word}", async (type: string) => {
  payload = buildInvalidCharacterPayload("identity", type) as any;
  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with invalid categories type {word}", async (type: string) => {
  payload = buildInvalidCharacterPayload("categories", type) as any;
  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with invalid category value {string}", async (category: string) => {
  payload = buildValidCharacterPayload({
    categories: [category as any],
  });

  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with mixed valid and invalid categories including {string}", async (invalidCategory: string) => {

  const validPayload = buildValidCharacterPayload();

  payload = buildValidCharacterPayload({
    categories: [
      ...validPayload.categories,
      invalidCategory as any, // rompemos el tipo intencionalmente
    ],
  });

  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with duplicated categories", async () => {
  const validPayload = buildValidCharacterPayload();

  const duplicatedCategory = validPayload.categories[0];

  payload = buildValidCharacterPayload({
    categories: [duplicatedCategory, duplicatedCategory],
  });

  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with invalid inspirations type {string}", async (type: string) => {
  payload = buildInvalidCharacterPayload(
    "inspirations",
    type
  ) as any;

  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with invalid inspiration item {string}", async (rawValue: string) => {
  let value: any;
  console.log(`Raw value: "${rawValue}"`);

  if (rawValue === "true") value = true;
  else if (rawValue === "false") value = false;
  else if (!isNaN(Number(rawValue)) && rawValue.trim() !== "") {
    value = Number(rawValue);
  } else {
    value = rawValue;
  }

  payload = buildValidCharacterPayload({
    inspirations: [value],
  } as any);

  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character without notes", async () => {
  payload = buildCharacterWithoutNotes();

  response = await ctx.characterApi.createCharacter(payload);

  responseBody = ((await response.json()) as CreateCharacterResponse).character;
  createdCharacterModel = mapApiToCharacterModel(responseBody);
});

When("I create a character with invalid notes type {string}", async (type: string) => {
  payload = buildInvalidCharacterPayload(
    "notes",
    type
  ) as any;

  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with invalid notes value {string}", async (rawValue: string) => {
  payload = buildValidCharacterPayload({
    notes: rawValue,
  });

  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character with extra unknown fields", async () => {
  payload = {
    ...buildValidCharacterPayload(),
    powerLevel: 9999,
    secretOrigin: "Unknown dimension",
  } as any;

  response = await ctx.characterApi.createCharacter(payload);

  responseBody = ((await response.json()) as CreateCharacterResponse).character;
  createdCharacterModel = mapApiToCharacterModel(responseBody);
});

When("I create a character with duplicated name against status {string}", async (status: string) => {
  const sourceStatus = status.trim().toUpperCase() as "ACTIVE" | "DRAFT";
  const duplicatedName = generateWaifuName();

  const existingPayload = buildValidCharacterPayload({
    name: duplicatedName,
    status: sourceStatus,
  });

  const existingResponse = await ctx.characterApi.createCharacter(existingPayload);
  expect(existingResponse.status()).toBe(201);

  payload = buildValidCharacterPayload({
    name: duplicatedName,
    status: "ACTIVE",
  });

  response = await ctx.characterApi.createCharacter(payload);
});

When("I create a character reusing a name from an ARCHIVED character", async () => {
  const reusableName = generateWaifuName();

  // 1) Creamos un character ACTIVE con nombre único.
  const sourcePayload = buildValidCharacterPayload({
    name: reusableName,
    status: "ACTIVE",
  });

  const sourceResponse = await ctx.characterApi.createCharacter(sourcePayload);
  expect(sourceResponse.status()).toBe(201);
  const sourceCharacter = ((await sourceResponse.json()) as CreateCharacterResponse).character;

  // 2) Lo archivamos para liberar el nombre.
  const archiveResponse = await ctx.characterApi.changeCharacterStatus(sourceCharacter.id, {
    status: "ARCHIVED",
  });
  expect(archiveResponse.status()).toBe(200);

  // 3) Reutilizamos el mismo nombre en un nuevo character ACTIVE.
  payload = buildValidCharacterPayload({
    name: reusableName,
    status: "ACTIVE",
  });

  response = await ctx.characterApi.createCharacter(payload);
  responseBody = ((await response.json()) as CreateCharacterResponse).character;
  createdCharacterModel = mapApiToCharacterModel(responseBody);
});


// Validación de respuesta HTTP

Then("the character should be created successfully", async () => {
  expect(response.status()).toBe(201);

  expect(responseBody).toBeDefined();
  expect(typeof responseBody.id).toBe("string");
  expect(responseBody.id.length).toBeGreaterThan(0);
});

Then("the response should contain the created character", async () => {
  expect(responseBody).toBeDefined();
  expect(typeof responseBody.id).toBe("string");
  expect(responseBody.id.length).toBeGreaterThan(0);
});

Then("the created character should match the payload", async function () {
  createdCharacterModel = mapApiToCharacterModel(responseBody);

  const expectedModel: CharacterModel = {
    ...payload,
    id: responseBody.id,
    status: payload.status ?? responseBody.status,
  };

  await attachJsonReport(this as any, {
    expected: expectedModel,
    actual: createdCharacterModel,
  });

  expect(createdCharacterModel).toEqual(expectedModel);
});

Then("the created character should be stored in the database", async function () {

  const dbCharacter = await findCharacterById(responseBody.id);

  expect(dbCharacter).not.toBeNull();

  if (!dbCharacter) {
    throw new Error(`Character ${responseBody.id} not found in database`);
  }

  const dbModel = mapMongoToCharacterModel(dbCharacter);

  await attachJsonReport(this as any, {
    apiModel: createdCharacterModel,
    dbModel,
  });

  expect(createdCharacterModel).toEqual(dbModel);
},
);

Then("I request the created character by id", async () => {
  response = await ctx.characterApi.getCharacterById(responseBody.id);
  expect(response.status()).toBe(200);

  getByIdResponseBody = (await response.json()) as GetCharacterByIdResponse;

  getByIdCharacterModel = mapApiToCharacterModel(getByIdResponseBody.character);
});

Then("the created character should match the get-by-id response", async () => {
  expect(getByIdCharacterModel).toEqual(createdCharacterModel);
});

Then("the created character should have status DRAFT", async () => {
  expect(response.status()).toBe(201);
  expect(responseBody.status).toBe("DRAFT");
});

Then("the created character should fail with status {int}", async (expectedStatus: number) => {
  expect(response.status()).toBe(expectedStatus);
});

Then("the status error message should include the invalid status value", async function () {
  const body = await response.json();
  const invalidStatus = (payload as any)?.status;
  const expectedError = `Status ${invalidStatus} is not valid. Allowed values: DRAFT | ACTIVE`;

  await attachJsonReport(this as any, {
    requestPayload: payload,
    invalidStatus,
    expectedError,
    responseStatus: response.status(),
    responseBody: body,
  });

  expect(body).toEqual({
    error: expectedError,
  });
});

Then("the character error message should be {string}", async function (expectedMessage: string) {

  const body = await response.json();

  await attachJsonReport(this as any, {
    requestPayload: payload,
    responseStatus: response.status(),
    responseBody: body,
  });

  expect(body).toEqual({
    error: expectedMessage,
  });
});

Then("the created character should not contain notes", () => {
  expect(responseBody.notes).toBeUndefined();
});

Then("the created character should not contain unknown fields", () => {
  expect(responseBody).not.toHaveProperty("powerLevel");
  expect(responseBody).not.toHaveProperty("secretOrigin");
});

AfterAll(async () => {
  await disposeCharacterContext(ctx);
  await closeDatabase();
});
