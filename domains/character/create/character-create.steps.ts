import { When, Then, AfterAll } from "@cucumber/cucumber";
import { expect, type APIResponse } from "@playwright/test";

import { ctx } from "../character.common.steps";
import { disposeCharacterContext } from "../character.context";

import type { CharacterDTO } from "../character.api";
import type { CharacterModel } from "../character.model";

import {
  buildValidCharacterPayload,
} from "./character-create.payload";

import {
  mapApiToCharacterModel,
  mapMongoToCharacterModel,
} from "../character.mapper";

import { findCharacterById } from "../../../utils/db/repositories/character.db.repository";
import { closeDatabase } from "../../../utils/db/mongo/mongo.client";

let response: APIResponse;
let responseBody: CharacterDTO;
let payload: Omit<CharacterDTO, "id">;
let createdCharacterModel: CharacterModel;

/**
 * STEPS – CREATE CHARACTER
 */

When("I create a character with a valid payload", async () => {
  payload = buildValidCharacterPayload();

  response = await ctx.characterApi.createCharacter(payload);

  responseBody = (await response.json()) as CharacterDTO;
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

Then("the created character should match the payload", async function() {
  createdCharacterModel = mapApiToCharacterModel(responseBody);

  const expectedModel: CharacterModel = {
    ...payload,
    id: responseBody.id,
  };

  await (this as any).attach(
    JSON.stringify(
      {
        expected: expectedModel,
        actual: createdCharacterModel,
      },
      null,
      2
    ),
    "application/json"
  );

  expect(createdCharacterModel).toEqual(expectedModel);
});

Then("the created character should be stored in the database", async function () {
  const dbCharacter = await findCharacterById(responseBody.id);

  expect(dbCharacter).not.toBeNull();

  if (!dbCharacter) {
    throw new Error(`Character ${responseBody.id} not found in database`);
  }

  const dbModel = mapMongoToCharacterModel(dbCharacter);

  await this.attach(
    JSON.stringify(
      {
        apiModel: createdCharacterModel,
        dbModel,
      },
      null,
      2
    ),
    "application/json"
  );

  expect(createdCharacterModel).toEqual(dbModel);
});

AfterAll(async () => {
  await disposeCharacterContext(ctx);
  await closeDatabase();
});