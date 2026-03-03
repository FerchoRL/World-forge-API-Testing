import type { UniverseDTO } from './universe.api'
import type { UniverseMongoDocument } from './universe.db'
import type { UniverseModel } from './universe.model'

export function mapApiToUniverseModel(dto: UniverseDTO): UniverseModel {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    premise: dto.premise,
    rules: dto.rules,
    notes: dto.notes,
  }
}

export function mapMongoToUniverseModel(doc: UniverseMongoDocument): UniverseModel {
  return {
    id: doc._id,
    name: doc.name,
    status: doc.status,
    premise: doc.premise,
    rules: doc.rules,
    notes: doc.notes,
  }
}
