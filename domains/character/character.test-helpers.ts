import type {
  ChangeCharacterStatusResponse,
  CharacterApi,
  CharacterDTO,
  CreateCharacterInput,
  CreateCharacterResponse,
} from "./character.api";
import type { CharacterId } from "./character.types";
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
export async function createCharacterWithValidPayload(characterApi: CharacterApi): Promise<CharacterId> {
  const payload = buildValidCharacterPayload();
  const response = await characterApi.createCharacter(payload);
  const body = (await response.json()) as CreateCharacterResponse;
  return body.character.id;
}

/**
 * Crea un character con el status enviado y devuelve el character creado.
 *
 * @param characterApi - Cliente API de character
 * @param status - Status inicial para crear el character
 * @returns Character creado por la API
 */
export async function createCharacterWithStatus(
  characterApi: CharacterApi,
  status: CreateCharacterInput["status"]
): Promise<CharacterDTO> {
  // Armamos un payload válido y solo sobreescribimos el status.
  const payload = buildValidCharacterPayload({ status });

  // Creamos el character y devolvemos el objeto completo.
  const response = await characterApi.createCharacter(payload);
  const body = (await response.json()) as CreateCharacterResponse;
  return body.character;
}

/**
 * Crea un character con nombre y status explícitos.
 *
 * @param characterApi - Cliente API de character
 * @param name - Nombre que debe usar el character
 * @param status - Status inicial para crear el character
 * @returns Character creado por la API
 */
export async function createCharacterWithNameAndStatus(
  characterApi: CharacterApi,
  name: string,
  status: CreateCharacterInput["status"]
): Promise<CharacterDTO> {
  // Reutilizamos payload válido y solo forzamos name/status para el escenario.
  const payload = buildValidCharacterPayload({ name, status });

  const response = await characterApi.createCharacter(payload);
  const body = (await response.json()) as CreateCharacterResponse;
  return body.character;
}

/**
 * Hace la transición de un character existente a ARCHIVED.
 *
 * @param characterApi - Cliente API de character
 * @param characterId - Id del character a archivar
 * @returns Character actualizado en estado ARCHIVED
 */
export async function transitionCharacterToArchived(
  characterApi: CharacterApi,
  characterId: CharacterId
): Promise<CharacterDTO> {
  // Ejecutamos la acción de dominio para archivar el character.
  const response = await characterApi.changeCharacterStatus(characterId, {
    status: "ARCHIVED",
  });

  // Devolvemos el character resultante de la transición.
  const body = (await response.json()) as ChangeCharacterStatusResponse;
  return body.character;
}
