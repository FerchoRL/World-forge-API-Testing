import type { CharacterApi, CharacterDTO } from "./character.api";
import { buildValidCharacterPayload } from "./create/character-create.payload";

/**
 * Test Helpers for Character domain
 * 
 * Reusable utilities for setting up test data across different test scenarios.
 * These helpers encapsulate common operations needed by multiple features.
 */

/**
 * Creates a character with valid payload and returns its ID
 * 
 * Useful for tests that need an existing character (e.g., UPDATE, DELETE, GET-BY-ID)
 * 
 * @param characterApi - The character API client instance
 * @returns The ID of the newly created character
 */
export async function createCharacterWithValidPayload(characterApi: CharacterApi): Promise<string> {
  const payload = buildValidCharacterPayload();
  const response = await characterApi.createCharacter(payload);
  const body = (await response.json()) as CharacterDTO;
  return body.id;
}
