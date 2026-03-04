import { AfterAll, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../universe.common.steps";
import { disposeUniverseContext } from "../universe.context";
import type {
  CreateUniverseRequest,
  CreateUniverseResponse,
  UniverseDTO,
} from "../universe.api";
import { buildValidUniversePayload } from "./universe-create.payload";
import { findUniverseById } from "../../../utils/db/repositories/universe.db.repository";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";

let response: APIResponse; // Respuesta HTTP cruda de Playwright (status, headers, body, etc.)
let responseBody: UniverseDTO; // Objeto universe ya parseado desde response.json()
let payload: CreateUniverseRequest;

When("I create a universe with minimal valid payload", async () => {
  const basePayload = buildValidUniversePayload();

  payload = {
    name: basePayload.name,
    premise: basePayload.premise,
  };

  response = await ctx.universeApi.createUniverse(payload);
  responseBody = ((await response.json()) as CreateUniverseResponse).universe;
});

When("I create a universe with full valid payload and status {word}", async (status: string) => {
  const normalizedStatus = status.trim().toUpperCase() as "DRAFT" | "ACTIVE";

  payload = buildValidUniversePayload({
    status: normalizedStatus,
  });

  response = await ctx.universeApi.createUniverse(payload);
  responseBody = ((await response.json()) as CreateUniverseResponse).universe;
});

Then("the universe create endpoint should respond with status code {int}", async (expectedStatusCode: number) => {
  expect(response.status()).toBe(expectedStatusCode);
});

Then("the universe response should contain the expected properties", async () => {
  expect(responseBody).toBeDefined();
  expect(responseBody).toHaveProperty("id");
  expect(responseBody).toHaveProperty("name");
  expect(responseBody).toHaveProperty("status");
  expect(responseBody).toHaveProperty("premise");

  if (responseBody.rules !== undefined) {
    expect(responseBody).toHaveProperty("rules");
  } else {
    expect(responseBody).not.toHaveProperty("rules");
  }

  if (responseBody.notes !== undefined) {
    expect(responseBody).toHaveProperty("notes");
  } else {
    expect(responseBody).not.toHaveProperty("notes");
  }
});

Then("the universe response properties should have the correct types", async () => {
  expect(typeof responseBody.id).toBe("string");
  expect(responseBody.id.trim().length).toBeGreaterThan(0);

  expect(typeof responseBody.name).toBe("string");
  expect(responseBody.name.trim().length).toBeGreaterThan(0);

  expect(typeof responseBody.status).toBe("string");

  expect(typeof responseBody.premise).toBe("string");
  expect(responseBody.premise.trim().length).toBeGreaterThan(0);

  if (responseBody.rules !== undefined) {
    expect(Array.isArray(responseBody.rules)).toBe(true);
    for (const rule of responseBody.rules) {
      expect(typeof rule).toBe("string");
    }
  }

  if (responseBody.notes !== undefined) {
    expect(typeof responseBody.notes).toBe("string");
  }
});

Then("the created universe should default status to DRAFT", async () => {
  expect(responseBody.status).toBe("DRAFT");
});

Then("the created universe response should match all values from the payload", async () => {
  expect(responseBody.name).toBe(payload.name);
  expect(responseBody.premise).toBe(payload.premise);
  expect(responseBody.status).toBe(payload.status);
  expect(responseBody.rules ?? []).toEqual(payload.rules ?? []);
  expect(responseBody.notes).toBe(payload.notes);
});

Then("the created universe should be stored in the database", async function () {
  const dbUniverse = await findUniverseById(responseBody.id);

  expect(dbUniverse).toBeTruthy();

  const persistedUniverse = dbUniverse!;

  await attachJsonReport(this as any, {
    responseBody,
    persistedUniverse,
  });

  expect(responseBody.id).toBe(persistedUniverse._id);
  expect(responseBody.name).toBe(persistedUniverse.name);
  expect(responseBody.premise).toBe(persistedUniverse.premise);
  expect(responseBody.status).toBe(persistedUniverse.status);

  expect(responseBody.rules ?? []).toEqual(persistedUniverse.rules ?? []);
  expect(responseBody.notes).toBe(persistedUniverse.notes);
});

AfterAll(async () => {
  await disposeUniverseContext(ctx);
  await closeDatabase();
});
