import { getDatabase } from "../mongo/mongo.client";
import type { CharacterMongoDocument } from "../../../domains/character/character.db";

/**
 * ===============================
 * Character Repository (DB Access)
 * ===============================
 *
 * Contiene queries específicas del dominio Character.
 *
 * - Solo acceso a datos
 * - No contiene mappers
 * - No contiene lógica de negocio
 */

const COLLECTION_NAME = "characters";

export async function findCharacterById(
  id: string
): Promise<CharacterMongoDocument | null> {
  const db = await getDatabase();

  return db
    .collection<CharacterMongoDocument>(COLLECTION_NAME)
    .findOne({ _id: id });
}

export async function findCharactersByStatus(
  status: string
): Promise<CharacterMongoDocument[]> {
  const db = await getDatabase();

  return db
    .collection<CharacterMongoDocument>(COLLECTION_NAME)
    .find({ status })
    .toArray();
}
