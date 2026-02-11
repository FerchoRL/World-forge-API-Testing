import type { CharacterDTO } from './character.api'
import type { CharacterMongoDocument } from './character.db'
import type { CharacterModel } from './character.model'

/**
 * ===============================
 * Character — Mappers
 * ===============================
 *
 * Transformaciones entre:
 * - API DTO
 * - Mongo Document
 * - Modelo canónico de test
 *
 * Los tests deben comparar CharacterModel contra CharacterModel.
 */

/**
 * API → Modelo de test
 */
export function mapApiToCharacterModel(dto: CharacterDTO): CharacterModel {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    categories: dto.categories,
    identity: dto.identity,
    inspirations: dto.inspirations,
    notes: dto.notes,
  }
}

/**
 * Mongo → Modelo de test
 */
export function mapMongoToCharacterModel(
  doc: CharacterMongoDocument
): CharacterModel {
  return {
    id: doc._id, // transformación clave
    name: doc.name,
    status: doc.status,
    categories: doc.categories,
    identity: doc.identity,
    inspirations: doc.inspirations,
    notes: doc.notes,
  }
}
