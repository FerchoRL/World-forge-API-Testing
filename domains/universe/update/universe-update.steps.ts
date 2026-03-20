import { AfterAll, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../universe.common.steps";
import { disposeUniverseContext } from "../universe.context";
import type {
  GetUniverseByIdResponse,
  UpdateUniverseCoreInput,
} from "../universe.api";
import type { UniverseModel } from "../universe.model";

import {
  createUniverseWithNameAndStatus,
  createUniverseWithValidPayload,
} from "../universe.test-helpers";
import {
  buildEmptyUniverseUpdatePayload,
  buildInvalidUniverseUpdateNonObjectPayload,
  buildInvalidUniverseUpdatePayload,
  buildSingleFieldUniverseUpdatePayload,
  buildValidUniverseUpdatePayload,
} from "./universe-update.payload";

import {
  mapApiToUniverseModel,
  mapMongoToUniverseModel,
} from "../universe.mapper";

import { findUniverseById } from "../../../utils/db/repositories/universe.db.repository";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";

let response: APIResponse;
let responseBody: GetUniverseByIdResponse;
let updatePayload: UpdateUniverseCoreInput;
let existingUniverseId: string;
let updatedUniverseModel: UniverseModel;

When("I update an existing universe with multiple valid fields", async () => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  updatePayload = buildValidUniverseUpdatePayload();

  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
  responseBody = (await response.json()) as GetUniverseByIdResponse;
  updatedUniverseModel = mapApiToUniverseModel(responseBody.universe);
});

When("I update an existing universe with a single valid field {string}", async (field: string) => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  updatePayload = buildSingleFieldUniverseUpdatePayload(field);

  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
  responseBody = (await response.json()) as GetUniverseByIdResponse;
  updatedUniverseModel = mapApiToUniverseModel(responseBody.universe);
});

When("I update a universe with an empty body", async () => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  updatePayload = buildEmptyUniverseUpdatePayload();

  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
});

When("I update a universe with invalid non-object body type {string}", async function (type: string) {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  const invalidBody = buildInvalidUniverseUpdateNonObjectPayload(type);
  updatePayload = {};
  response = await ctx.universeApi.updateUniverse(existingUniverseId, invalidBody as any);

  await attachJsonReport(this as any, {
    requestPayload: invalidBody,
  });
});

When(/^I attempt to update a universe with an unsupported field status$/, async () => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  const invalidPayload = {
    status: "ACTIVE" as any,
  } as any;

  updatePayload = {};
  response = await ctx.universeApi.updateUniverse(existingUniverseId, invalidPayload);
});

When("I attempt to update a universe with mixed valid and unsupported fields", async () => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  const invalidPayload = {
    name: "Nova",
    status: "ACTIVE" as any,
  } as any;

  updatePayload = {};
  response = await ctx.universeApi.updateUniverse(existingUniverseId, invalidPayload);
});

When("I update a universe with invalid name type {word}", async (type: string) => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  updatePayload = buildInvalidUniverseUpdatePayload("name", type);
  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
});

When("I update a universe with invalid premise type {word}", async (type: string) => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  updatePayload = buildInvalidUniverseUpdatePayload("premise", type);
  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
});

When("I update a universe with invalid rules type {word}", async (type: string) => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  updatePayload = buildInvalidUniverseUpdatePayload("rules", type);
  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
});

When("I update a universe with invalid rule item value {string}", async (rawValue: string) => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  const invalidRuleItem: unknown = rawValue === "true"
    ? true
    : rawValue === "false"
      ? false
      : rawValue === "null"
        ? null
        : !Number.isNaN(Number(rawValue)) && rawValue.trim() !== ""
          ? Number(rawValue)
          : rawValue;

  updatePayload = {
    rules: [invalidRuleItem as any],
  };

  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
});

When(/^I update a universe with duplicated rules considering case and spaces$/, async () => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  updatePayload = {
    rules: ["No cure", " no cure "],
  };

  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
});

When(/^I update a universe with invalid notes value "([^"]*)"$/, async (rawValue: string) => {
  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  const invalidNotesValue: unknown = rawValue === "true"
    ? true
    : rawValue === "false"
      ? false
      : rawValue === "null"
        ? null
        : !Number.isNaN(Number(rawValue)) && rawValue.trim() !== ""
          ? Number(rawValue)
          : rawValue;

  updatePayload = {
    notes: invalidNotesValue as any,
  };

  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
});

When("I attempt to update a universe with a non-existent ID", async () => {
  const nonExistentId = `universe_nonexistent_${Date.now()}`;

  updatePayload = {
    name: "Nova",
  };

  response = await ctx.universeApi.updateUniverse(nonExistentId, updatePayload);
});

When("I attempt to update a universe with an already existing name from status {string}", async (status: string) => {
  const sourceStatus = status.trim().toUpperCase() as "ACTIVE" | "DRAFT";
  const duplicateName = buildValidUniverseUpdatePayload().name!;

  await createUniverseWithNameAndStatus(ctx.universeApi, duplicateName, sourceStatus);

  existingUniverseId = await createUniverseWithValidPayload(ctx.universeApi);

  updatePayload = {
    name: duplicateName,
  };

  response = await ctx.universeApi.updateUniverse(existingUniverseId, updatePayload);
});

When("I attempt to update a universe with a blank ID", async () => {
  const rawId = "%20";

  updatePayload = {
    name: "Nova",
  };

  response = await ctx.apiContext.patch(`/universes/${rawId}`, {
    data: updatePayload,
  });
});

Then("the universe update should be successful", async () => {
  expect(response.status()).toBe(200);
  expect(responseBody).toBeDefined();
  expect(responseBody.universe).toBeDefined();
  expect(responseBody.universe.id).toBeDefined();
});

Then("the updated universe should reflect the changes from the update payload", async () => {
  for (const [field, expectedValue] of Object.entries(updatePayload)) {
    const actualValue = responseBody.universe[field as keyof typeof responseBody.universe];
    expect(actualValue).toEqual(expectedValue);
  }
});

Then("the updated universe should be stored in the database", async function () {
  const dbUniverse = await findUniverseById(existingUniverseId);

  expect(dbUniverse).not.toBeNull();

  if (!dbUniverse) {
    throw new Error(`Universe ${existingUniverseId} not found in database`);
  }

  const dbModel = mapMongoToUniverseModel(dbUniverse);

  await attachJsonReport(this as any, {
    updatedUniverseModel,
    dbModel,
  });

  expect(updatedUniverseModel).toEqual(dbModel);
});

Then("the universe update should fail with status {int}", async (expectedStatus: number) => {
  expect(response.status()).toBe(expectedStatus);
});

Then("the updated universe error message should be {string}", async function (expectedMessage: string) {
  const body = await response.json();

  await attachJsonReport(this as any, {
    requestPayload: updatePayload,
    responseStatus: response.status(),
    responseBody: body,
  });

  expect(body).toEqual({
    error: expectedMessage,
  });
});

AfterAll(async () => {
  await disposeUniverseContext(ctx);
  await closeDatabase();
});
