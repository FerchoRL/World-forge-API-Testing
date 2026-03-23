import { AfterAll, Given, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../character.common.steps";
import { disposeCharacterContext } from "../character.context";
import type { CharacterDTO, CreateCharacterResponse, GetCharacterByIdResponse } from "../character.api";
import {
  createCharacterWithNameAndStatus,
  createCharacterWithStatus,
  transitionCharacterToArchived,
} from "../character.test-helpers";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";

let response: APIResponse;
let sourceCharacter: CharacterDTO | undefined;
let createdCharacter: CharacterDTO | undefined;
let sourceCharacterAfterCreation: CharacterDTO | undefined;
let conflictingCharacter: CharacterDTO | undefined;
let errorResponseBody: { error?: string } | undefined;

function resetScenarioState(): void {
  sourceCharacter = undefined;
  createdCharacter = undefined;
  sourceCharacterAfterCreation = undefined;
  conflictingCharacter = undefined;
  errorResponseBody = undefined;
}

Given("I have an archived source character for create from archived", async function () {
  resetScenarioState();

  const activeCharacter = await createCharacterWithStatus(ctx.characterApi, "ACTIVE");
  sourceCharacter = await transitionCharacterToArchived(ctx.characterApi, activeCharacter.id);
});

Given("I have a non archived source character for create from archived with status {string}", async function (status: string) {
  resetScenarioState();

  const normalizedStatus = status.trim().toUpperCase() as "ACTIVE" | "DRAFT";
  sourceCharacter = await createCharacterWithStatus(ctx.characterApi, normalizedStatus);
});

Given("I have an archived source character for create from archived with duplicated name against status {string}", async function (status: string) {
  resetScenarioState();

  const conflictStatus = status.trim().toUpperCase() as "ACTIVE" | "DRAFT";

  const activeCharacter = await createCharacterWithStatus(ctx.characterApi, "ACTIVE");
  sourceCharacter = await transitionCharacterToArchived(ctx.characterApi, activeCharacter.id);
  conflictingCharacter = await createCharacterWithNameAndStatus(ctx.characterApi, sourceCharacter.name, conflictStatus);
});

When("I create a character from the archived source", async function () {
  createdCharacter = undefined;
  errorResponseBody = undefined;

  response = await ctx.characterApi.createCharacterFromArchived(sourceCharacter!.id);

  const responseBody = (await response.json()) as CreateCharacterResponse | { error?: string };

  if (response.status() < 400) {
    createdCharacter = (responseBody as CreateCharacterResponse).character;
  } else {
    errorResponseBody = responseBody as { error?: string };
  }
});

When("I create a character from a non existing archived source", async function () {
  resetScenarioState();

  response = await ctx.characterApi.createCharacterFromArchived("character-does-not-exist");
  errorResponseBody = (await response.json()) as { error?: string };
});

When("I create a character from the non archived source", async function () {
  createdCharacter = undefined;
  errorResponseBody = undefined;

  response = await ctx.characterApi.createCharacterFromArchived(sourceCharacter!.id);
  errorResponseBody = (await response.json()) as { error?: string };
});

When("I create a character from archived source id {string}", async function (id: string) {
  resetScenarioState();

  const resolvedId = id === "__SPACE__" ? " " : id;

  if (!resolvedId.trim()) {
    response = await ctx.apiContext.post(`/characters/${resolvedId}/create-from-archived`);
  } else {
    response = await ctx.characterApi.createCharacterFromArchived(resolvedId);
  }

  errorResponseBody = (await response.json()) as { error?: string };
});

Then("the create from archived character endpoint should respond with status code {int}", async function (expectedStatusCode: number) {
  await attachJsonReport(this as any, {
    sourceCharacter,
    conflictingCharacter,
    createdCharacter,
    responseStatus: response.status(),
    responseBody: response.status() < 400 ? { character: createdCharacter } : errorResponseBody,
  });

  expect(response.status()).toBe(expectedStatusCode);
});

Then("the created character from archived should have a different id than source", async () => {
  expect(createdCharacter!.id).not.toBe(sourceCharacter!.id);
});

Then("the created character from archived should default status to DRAFT", async () => {
  expect(createdCharacter!.status).toBe("DRAFT");
});

Then("the created character from archived should preserve the archived source data", async () => {
  expect(createdCharacter!.name).toBe(sourceCharacter!.name);
  expect(createdCharacter!.identity).toBe(sourceCharacter!.identity);
  expect(createdCharacter!.categories).toEqual(sourceCharacter!.categories);
  expect(createdCharacter!.inspirations).toEqual(sourceCharacter!.inspirations);
  expect(createdCharacter!.notes).toBe(sourceCharacter!.notes);
  expect(createdCharacter!.image).toBe(sourceCharacter!.image);
});

Then("the archived source character should remain unchanged after creation", async function () {
  const sourceCharacterResponse = await ctx.characterApi.getCharacterById(sourceCharacter!.id);
  expect(sourceCharacterResponse.status()).toBe(200);

  sourceCharacterAfterCreation = ((await sourceCharacterResponse.json()) as GetCharacterByIdResponse).character;

  await attachJsonReport(this as any, {
    sourceCharacterBeforeCreation: sourceCharacter,
    sourceCharacterAfterCreation,
  });

  expect(sourceCharacterAfterCreation).toEqual(sourceCharacter);
});

Then("the create from archived character error message should be {string}", async function (expectedMessage: string) {
  expect(errorResponseBody).toHaveProperty("error");
  expect(errorResponseBody?.error).toBe(expectedMessage);
});

AfterAll(async () => {
  await disposeCharacterContext(ctx);
  await closeDatabase();
});