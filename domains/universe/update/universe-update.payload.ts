import type { UpdateUniverseCoreInput } from "../universe.api";
import { generateUniverseName } from "../universe-name.generator";
import {
  buildInvalidFieldValue,
  type FieldKind,
} from "../../../tests/shared/test-data/invalid-value.factory";

/**
 * ===============================
 * Universe Update Payload Factory
 * ===============================
 *
 * Factory central para generar payloads válidos para
 * el endpoint PATCH /universes/:id.
 *
 * Reglas:
 * - Siempre parte de payloads válidos del dominio.
 * - Permite construir variantes específicas para escenarios.
 * - Evita hardcodear payloads directamente en los steps.
 */

export function buildValidUniverseUpdatePayload(
  overrides?: Partial<UpdateUniverseCoreInput>
): UpdateUniverseCoreInput {
  return {
    name: generateUniverseName(),
    premise: "World of floating isles",
    notes: "Updated notes",
    rules: ["No resurrection", "Magic has cost"],
    ...overrides,
  };
}

export function buildSingleFieldUniverseUpdatePayload(
  field: string
): UpdateUniverseCoreInput {
  switch (field) {
    case "name":
      return {
        name: generateUniverseName(),
      };
    case "premise":
      return {
        premise: "Updated premise for a fractured world of floating isles.",
      };
    case "notes":
      return {
        notes: "Updated notes content",
      };
    case "rules":
      return {
        rules: ["No resurrection", "Magic has cost"],
      };
    default:
      throw new Error(`Unsupported single-field update case: ${field}`);
  }
}

export function buildEmptyUniverseUpdatePayload(): UpdateUniverseCoreInput {
  return {};
}

export function buildInvalidUniverseUpdateNonObjectPayload(type: string): unknown {
  switch (type) {
    case "array":
      return [];
    case "string":
      return "invalid-body";
    case "number":
      return 123;
    case "booleanTrue":
      return true;
    case "booleanFalse":
      return false;
    default:
      throw new Error(`Unsupported invalid non-object payload type: ${type}`);
  }
}

type UniverseUpdateInvalidField = "name" | "premise" | "rules" | "notes";

const universeUpdateFieldKind: Record<UniverseUpdateInvalidField, FieldKind> = {
  name: "string",
  premise: "string",
  rules: "array",
  notes: "string",
};

export function buildInvalidUniverseUpdatePayload(
  field: UniverseUpdateInvalidField,
  invalidType: string,
  options?: { invalidValue?: unknown }
): UpdateUniverseCoreInput {
  const kind = universeUpdateFieldKind[field];
  const invalidValue = options?.invalidValue ?? buildInvalidFieldValue(kind, invalidType);

  return {
    [field]: invalidValue,
  } as UpdateUniverseCoreInput;
}
