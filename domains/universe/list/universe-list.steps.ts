// ===== IMPORTS =====
import { AfterAll, Then, When } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";
import { ctx } from "../universe.common.steps";
import { disposeUniverseContext } from "../universe.context";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";
import type { ListUniversesResponse } from "../universe.api";
import { attachJsonReport } from "../../../utils/reporting/cucumber-report.helper";
import { VALID_STATUSES } from "../../../contracts/common/status";

let response: APIResponse;
let responseBodyList: ListUniversesResponse;

// ===== HELPERS =====
/**
 * Valida que todos los universes retornados contengan el término buscado
 * dentro de un campo string específico (case-insensitive).
 */
function assertAllUniversesContainInStringField(
  universes: ListUniversesResponse["universes"],
  search: string,
  getFieldValue: (universe: any) => string
): void {
  const normalizedSearch = search.toLowerCase();
  for (const universe of universes) {
    const fieldValue = getFieldValue(universe).toLowerCase();
    expect(fieldValue).toContain(normalizedSearch);
  }
}

/**
 * Valida que todos los universes retornados contengan el término buscado
 * dentro de al menos un valor de un campo string[] (case-insensitive).
 */
function assertAllUniversesContainInStringArrayField(
  universes: ListUniversesResponse["universes"],
  search: string,
  getFieldValues: (universe: any) => string[]
): void {
  const normalizedSearch = search.trim().toLowerCase();
  for (const universe of universes) {
    const fieldValues = getFieldValues(universe).map((value) => value.toLowerCase());
    expect(fieldValues.some((value) => value.includes(normalizedSearch))).toBe(true);
  }
}

// ===== WHEN STEPS =====
When("I request the list of universes without pagination parameters", async () => {
  response = await ctx.universeApi.listUniverses();
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

When("I request the list of universes with page {int} and limit {int}", async (page: number, limit: number) => {
  response = await ctx.universeApi.listUniverses({ page, limit });
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

When(/^I request the list of universes with invalid page (\S+)$/, async (page: string) => {
  const parsedPage = !isNaN(Number(page)) ? Number(page) : page;

  response = await ctx.universeApi.listUniverses({ page: parsedPage });
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

When(/^I request the list of universes with invalid limit (\S+)$/, async (limit: string) => {
  const parsedLimit = !isNaN(Number(limit)) ? Number(limit) : limit;

  response = await ctx.universeApi.listUniverses({ limit: parsedLimit });
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

When("I request the list of universes with unknown query parameters", async () => {
  response = await ctx.apiContext.get("/universes?pagina=2&limite=6");
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

When("I request the list of universes with pagination parameters and search longer than 120 characters", async () => {
  const search = "a".repeat(121);
  response = await ctx.universeApi.listUniverses({ page: 1, limit: 10, search });
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

When(/^I request the list of universes with pagination parameters and search "([^"]+)"$/, async (search: string) => {
  response = await ctx.universeApi.listUniverses({ page: 1, limit: 10, search });
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

When("I request the list of universes with pagination parameters and status {string}", async (status: string) => {
  response = await ctx.universeApi.listUniverses({ page: 1, limit: 10, status });
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

When("I request the list of universes with page {int}, limit {int}, search {string} and status {string}", async (page: number, limit: number, search: string, status: string) => {
  response = await ctx.universeApi.listUniverses({ page, limit, search, status });
  responseBodyList = (await response.json()) as ListUniversesResponse;
});

// ===== THEN STEPS =====
Then("the universe list endpoint should respond with status code {int}", async function (expectedStatus: number) {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    expectedStatus,
    actualStatus: response.status(),
  });

  expect(response.status()).toBe(expectedStatus);
});

Then("the response should contain the default pagination values for universe list", async function () {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    responseStatus: response.status(),
    responseBody: responseBodyList,
    expected: {
      page: 1,
      limit: 10,
    },
  });

  expect(responseBodyList.page).toBe(1);
  expect(responseBodyList.limit).toBe(10);

  expect(Array.isArray(responseBodyList.universes)).toBe(true);
  expect(typeof responseBodyList.total).toBe("number");
});

Then("the universe list response should respect pagination page {int} and limit {int}", async function (expectedPage: number, expectedLimit: number) {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    responseStatus: response.status(),
    responseBody: responseBodyList,
    expected: {
      page: expectedPage,
      limit: expectedLimit,
    },
  });

  expect(responseBodyList.page).toBe(expectedPage);
  expect(responseBodyList.limit).toBe(expectedLimit);

  expect(Array.isArray(responseBodyList.universes)).toBe(true);
  expect(responseBodyList.universes.length).toBeLessThanOrEqual(expectedLimit);
  expect(typeof responseBodyList.total).toBe("number");
});

Then("the universe list response should cap limit to {int}", async function (cappedLimit: number) {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    responseStatus: response.status(),
    responseBody: responseBodyList,
    expected: {
      page: 1,
      limit: cappedLimit,
    },
  });

  expect(responseBodyList.page).toBe(1);
  expect(responseBodyList.limit).toBe(cappedLimit);

  expect(Array.isArray(responseBodyList.universes)).toBe(true);
  expect(responseBodyList.universes.length).toBeLessThanOrEqual(cappedLimit);
  expect(typeof responseBodyList.total).toBe("number");
});

Then("the universe list response should return an empty universes array for page {int} and limit {int}", async function (expectedPage: number, expectedLimit: number) {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    responseStatus: response.status(),
    responseBody: responseBodyList,
    expected: {
      page: expectedPage,
      limit: expectedLimit,
      universesLength: 0,
    },
  });

  expect(responseBodyList.page).toBe(expectedPage);
  expect(responseBodyList.limit).toBe(expectedLimit);

  expect(Array.isArray(responseBodyList.universes)).toBe(true);
  expect(responseBodyList.universes.length).toBe(0);
  expect(typeof responseBodyList.total).toBe("number");
});

Then("the universe list response should ignore unknown query parameters", async function () {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    responseStatus: response.status(),
    responseBody: responseBodyList,
    expected: {
      page: 1,
      limit: 10,
    },
  });

  expect(responseBodyList.page).toBe(1);
  expect(responseBodyList.limit).toBe(10);
  expect(Array.isArray(responseBodyList.universes)).toBe(true);
  expect(typeof responseBodyList.total).toBe("number");
});

Then("each returned universe should match the UniverseDTO contract", async function () {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    responseStatus: response.status(),
    sampleUniverses: responseBodyList.universes.slice(0, 5),
    totalReturned: responseBodyList.universes.length,
  });

  expect(Array.isArray(responseBodyList.universes)).toBe(true);
  expect(typeof responseBodyList.page).toBe("number");
  expect(typeof responseBodyList.limit).toBe("number");
  expect(typeof responseBodyList.total).toBe("number");

  for (const universe of responseBodyList.universes) {
    expect(typeof universe.id).toBe("string");
    expect(universe.id.trim().length).toBeGreaterThan(0);

    expect(typeof universe.name).toBe("string");
    expect(universe.name.trim().length).toBeGreaterThan(0);

    expect(VALID_STATUSES).toContain(universe.status);

    expect(typeof universe.premise).toBe("string");
    expect(universe.premise.trim().length).toBeGreaterThan(0);

    if (universe.rules !== undefined) {
      expect(Array.isArray(universe.rules)).toBe(true);
      for (const rule of universe.rules) {
        expect(typeof rule).toBe("string");
      }
    }

    if (universe.notes !== undefined) {
      expect(typeof universe.notes).toBe("string");
    }
  }
});

Then("the universe list response error message should be {string}", async function (expectedMessage: string) {
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

/**
 * Valida que todos los universes retornados contengan el término buscado
 * dentro de un campo string específico (case-insensitive).
 */

Then("all returned universes should contain {string} in {string}", async function (search: string, field: string) {
  expect(responseBodyList.universes.length).toBeGreaterThan(0);
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    searchTerm: search,
    results: responseBodyList.universes.map((universe) => {
      const result: any = { [field]: (universe as any)[field] };
      // Solo incluimos el nombre en el reporte si no es el campo que se está validando, para evitar repetir información innecesaria.
      if (field !== "name") {
        result.name = universe.name;
      }
      return result;
    }),
  });
  assertAllUniversesContainInStringField(responseBodyList.universes, search, (universe) => (universe as any)[field]);
});

Then("all returned universes should contain {string} in rules", async function (search: string) {
  await attachJsonReport(this as any, {
    requestUrl: response.url(),
    searchTerm: search,
    results: responseBodyList.universes.map((universe) => ({
      name: universe.name,
      rules: universe.rules,
    })),
  });
  assertAllUniversesContainInStringArrayField(
    responseBodyList.universes,
    search,
    (universe) => Array.isArray(universe.rules) ? universe.rules : []
  );
});

AfterAll(async () => {
  await disposeUniverseContext(ctx);
  await closeDatabase();
});
