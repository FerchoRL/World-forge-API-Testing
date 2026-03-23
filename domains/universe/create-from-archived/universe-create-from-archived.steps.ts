import { AfterAll, Given, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../universe.common.steps";
import { disposeUniverseContext } from "../universe.context";
import type { CreateUniverseResponse, GetUniverseByIdResponse, UniverseDTO } from "../universe.api";
import {
  createUniverseWithNameAndStatus,
  createUniverseWithStatus,
  transitionUniverseToArchived,
} from "../universe.test-helpers";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";

let response: APIResponse;
let sourceUniverse: UniverseDTO | undefined;
let createdUniverse: UniverseDTO | undefined;
let sourceUniverseAfterCreation: UniverseDTO | undefined;
let conflictingUniverse: UniverseDTO | undefined;
let errorResponseBody: { error?: string } | undefined;

function resetScenarioState(): void {
  sourceUniverse = undefined;
  createdUniverse = undefined;
  sourceUniverseAfterCreation = undefined;
  conflictingUniverse = undefined;
  errorResponseBody = undefined;
}

Given("I have an archived source universe for create from archived", async function () {
  resetScenarioState();

  const activeUniverse = await createUniverseWithStatus(ctx.universeApi, "ACTIVE");
  sourceUniverse = await transitionUniverseToArchived(ctx.universeApi, activeUniverse.id);
});

Given("I have a non archived source universe for create from archived with status {string}", async function (status: string) {
  resetScenarioState();

  const normalizedStatus = status.trim().toUpperCase() as "ACTIVE" | "DRAFT";
  sourceUniverse = await createUniverseWithStatus(ctx.universeApi, normalizedStatus);
});

Given("I have an archived source universe for create from archived with duplicated name against status {string}", async function (status: string) {
  resetScenarioState();

  const conflictStatus = status.trim().toUpperCase() as "ACTIVE" | "DRAFT";

  const activeUniverse = await createUniverseWithStatus(ctx.universeApi, "ACTIVE");
  sourceUniverse = await transitionUniverseToArchived(ctx.universeApi, activeUniverse.id);
  conflictingUniverse = await createUniverseWithNameAndStatus(ctx.universeApi, sourceUniverse.name, conflictStatus);
});

When("I create a universe from the archived source", async function () {
  createdUniverse = undefined;
  errorResponseBody = undefined;

  response = await ctx.universeApi.createUniverseFromArchived(sourceUniverse!.id);

  const responseBody = (await response.json()) as CreateUniverseResponse | { error?: string };

  if (response.status() < 400) {
    createdUniverse = (responseBody as CreateUniverseResponse).universe;
  } else {
    errorResponseBody = responseBody as { error?: string };
  }
});

When("I create a universe from a non existing archived source", async function () {
  resetScenarioState();

  response = await ctx.universeApi.createUniverseFromArchived("universe-does-not-exist");
  errorResponseBody = (await response.json()) as { error?: string };
});

When("I create a universe from the non archived source", async function () {
  createdUniverse = undefined;
  errorResponseBody = undefined;

  response = await ctx.universeApi.createUniverseFromArchived(sourceUniverse!.id);
  errorResponseBody = (await response.json()) as { error?: string };
});

When("I create a universe from archived source id {string}", async function (id: string) {
  resetScenarioState();

  const resolvedId = id === "__SPACE__" ? " " : id;

  if (!resolvedId.trim()) {
    response = await ctx.apiContext.post(`/universes/${resolvedId}/create-from-archived`);
  } else {
    response = await ctx.universeApi.createUniverseFromArchived(resolvedId);
  }

  errorResponseBody = (await response.json()) as { error?: string };
});

Then("the create from archived universe endpoint should respond with status code {int}", async function (expectedStatusCode: number) {
  await attachJsonReport(this as any, {
    sourceUniverse,
    conflictingUniverse,
    createdUniverse,
    responseStatus: response.status(),
    responseBody: response.status() < 400 ? { universe: createdUniverse } : errorResponseBody,
  });

  expect(response.status()).toBe(expectedStatusCode);
});

Then("the created universe from archived should have a different id than source", async () => {
  expect(createdUniverse!.id).not.toBe(sourceUniverse!.id);
});

Then("the created universe from archived should preserve the archived source data", async function () {
  expect(createdUniverse!.name).toBe(sourceUniverse!.name);
  expect(createdUniverse!.premise).toBe(sourceUniverse!.premise);
  expect(createdUniverse!.rules ?? []).toEqual(sourceUniverse!.rules ?? []);
  expect(createdUniverse!.notes).toBe(sourceUniverse!.notes);
});

Then("the archived source universe should remain unchanged after creation", async function () {
  const sourceUniverseResponse = await ctx.universeApi.getUniverseById(sourceUniverse!.id);
  expect(sourceUniverseResponse.status()).toBe(200);

  sourceUniverseAfterCreation = ((await sourceUniverseResponse.json()) as GetUniverseByIdResponse).universe;

  await attachJsonReport(this as any, {
    sourceUniverseBeforeCreation: sourceUniverse,
    sourceUniverseAfterCreation,
  });

  expect(sourceUniverseAfterCreation).toEqual(sourceUniverse);
});

Then("the created universe from archived should default status to DRAFT", async () => {
  expect(createdUniverse!.status).toBe("DRAFT");
});

Then("the create from archived universe error message should be {string}", async function (expectedMessage: string) {
  expect(errorResponseBody).toHaveProperty("error");
  expect(errorResponseBody?.error).toBe(expectedMessage);
});

AfterAll(async () => {
  await disposeUniverseContext(ctx);
  await closeDatabase();
});
