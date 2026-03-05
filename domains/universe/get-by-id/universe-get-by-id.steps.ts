import { AfterAll, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { VALID_STATUSES } from "../../../contracts/common/status";
import type { GetUniverseByIdResponse } from "../universe.api";
import { ctx } from "../universe.common.steps";
import { disposeUniverseContext } from "../universe.context";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";
import { findUniverseById } from "../../../utils/db/repositories/universe.db.repository";
import { mapApiToUniverseModel, mapMongoToUniverseModel } from "../universe.mapper";

let response: APIResponse;
let responseBodyGetById: GetUniverseByIdResponse;

type UniverseIdTestData = {
  universeId: string;
};

function loadUniverseIdTestData(): UniverseIdTestData {
  const filePath = path.resolve(
    process.cwd(),
    "tests/shared/test-data/universe-ids.local.json"
  );

  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as UniverseIdTestData;
}

When("I request the universe by id {string}", async (id: string) => {
  response = await ctx.universeApi.getUniverseById(id);
  responseBodyGetById = (await response.json()) as GetUniverseByIdResponse;
});

When("I request the universe by id from test data", async () => {
  const testData = loadUniverseIdTestData();
  const id = testData.universeId;

  response = await ctx.universeApi.getUniverseById(id);
  responseBodyGetById = (await response.json()) as GetUniverseByIdResponse;
});

Then("the universe get by id endpoint should respond with status code {int}", async function (expectedStatus: number) {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    expectedStatus,
    actualStatus: response.status(),
    responseBody: responseBodyGetById,
  });

  expect(response.status()).toBe(expectedStatus);
});

Then("the response should contain a universe", async () => {
  expect(responseBodyGetById).toHaveProperty("universe");
  expect(typeof responseBodyGetById.universe).toBe("object");
  expect(responseBodyGetById.universe).not.toBeNull();
});

Then("the universe should have a valid id", async () => {
  expect(typeof responseBodyGetById.universe.id).toBe("string");
  expect(responseBodyGetById.universe.id.trim().length).toBeGreaterThan(0);
});

Then("the universe should have a name", async () => {
  expect(typeof responseBodyGetById.universe.name).toBe("string");
  expect(responseBodyGetById.universe.name.trim().length).toBeGreaterThan(0);
});

Then("the universe should have a valid status", async () => {
  expect(VALID_STATUSES).toContain(responseBodyGetById.universe.status);
});

Then("the universe should have a premise", async () => {
  expect(typeof responseBodyGetById.universe.premise).toBe("string");
  expect(responseBodyGetById.universe.premise.trim().length).toBeGreaterThan(0);
});

Then("the universe rules should be valid if present", async () => {
  const { rules } = responseBodyGetById.universe;

  if (rules !== undefined) {
    expect(Array.isArray(rules)).toBe(true);
    for (const rule of rules) {
      expect(typeof rule).toBe("string");
      expect(rule.trim().length).toBeGreaterThan(0);
    }
  }
});

Then("the universe notes should be valid if present", async () => {
  const { notes } = responseBodyGetById.universe;

  if (notes !== undefined) {
    expect(typeof notes).toBe("string");
  }
});

Then("the universe get by id response error message should be {string}", async function (expectedMessage: string) {
  const errorBody = await response.json();

  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    responseStatus: response.status(),
    responseBody: errorBody,
    expectedMessage,
  });

  expect(errorBody).toHaveProperty("error");
  expect(errorBody.error).toBe(expectedMessage);
});

Then("the response should match the universe stored in the database", async function () {
  const apiUniverse = responseBodyGetById.universe;

  const dbUniverse = await findUniverseById(apiUniverse.id);

  const apiModel = mapApiToUniverseModel(apiUniverse);
  const dbModel = mapMongoToUniverseModel(dbUniverse!);

  await attachJsonReport(this as any, {
    apiModel,
    dbModel,
  });

  expect(apiModel).toEqual(dbModel);

  expect(apiUniverse.id).toBe(dbUniverse!._id);
  expect(apiUniverse.name).toBe(dbUniverse!.name);
  expect(apiUniverse.status).toBe(dbUniverse!.status);
  expect(apiUniverse.premise).toBe(dbUniverse!.premise);

  expect(apiUniverse.rules ?? []).toEqual(dbUniverse!.rules ?? []);
  expect(apiUniverse.notes).toBe(dbUniverse!.notes);
});

AfterAll(async () => {
  await disposeUniverseContext(ctx);
  await closeDatabase();
});
