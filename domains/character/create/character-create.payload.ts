import type { CharacterDTO } from "../character.api";
import type { CategoryName } from "../character.types";
import { generateWaifuName } from "./character-name.generator";

import { buildInvalidFieldValue, type FieldKind } from "../../../tests/shared/test-data/invalid-value.factory";

/**
 * ===============================
 * Character Create Payload Factory
 * ===============================
 *
 * Factory central para generar payloads válidos y variantes
 * para el endpoint POST /characters.
 *
 * Reglas:
 * - Siempre parte de un payload válido base.
 * - Permite overrides para escenarios específicos.
 * - Evita hardcodear datos directamente en los steps.
 * - Escalable para múltiples variaciones.
 */

type CreateCharacterPayload = Omit<CharacterDTO, "id"> & { status?: CharacterDTO["status"] };

type CharacterInvalidField =
  | "name"
  | "identity"
  | "categories"
  | "status"
  | "inspirations"
  | "notes";

const characterFieldKind: Record<CharacterInvalidField, FieldKind> = {
  name: "string",
  identity: "string",
  notes: "string",
  status: "string",
  categories: "array",
  inspirations: "array",
};


/**
 * Payload base válido.
 */
export function buildValidCharacterPayload(
  overrides?: Partial<CreateCharacterPayload>
): CreateCharacterPayload {
  return {
    name: generateWaifuName(),
    status: "ACTIVE",
    categories: [
      "PersonajeTrágico",
      "Melancólico",
      "Dualidad",
      "AmorComoMotor"
    ] as CategoryName[],
    identity:
      "Una joven sacerdotisa marcada por la pérdida, cuya dulzura oculta una determinación feroz para proteger aquello que ama.",
    inspirations: [
      "Anime de fantasía independiente",
      "Folklore japonés",
      "Heroína silenciosa"
    ],
    notes:
      "Contraste entre fragilidad emocional y fortaleza espiritual. Diseño visual con tonos oscuros y mirada profunda.",
    ...overrides,
  };
}

/**
 * Variante: Draft character
 */
export function buildDraftCharacterPayload(
  overrides?: Partial<CreateCharacterPayload>
): CreateCharacterPayload {
  return buildValidCharacterPayload({
    status: "DRAFT",
    ...overrides,
  });
}

/**
 * Variante: Archived character
 */
export function buildArchivedCharacterPayload(
  overrides?: Partial<CreateCharacterPayload>
): CreateCharacterPayload {
  return buildValidCharacterPayload({
    status: "ARCHIVED",
    ...overrides,
  });
}

/**
 * Variante: Custom categories
 */
export function buildCharacterWithCategories(
  categories: CategoryName[],
  overrides?: Partial<CreateCharacterPayload>
): CreateCharacterPayload {
  return buildValidCharacterPayload({
    categories,
    ...overrides,
  });
}

/**
 * Variante: Sin notes (campo opcional)
 */
export function buildCharacterWithoutNotes(
  overrides?: Partial<CreateCharacterPayload>
): CreateCharacterPayload {
  const base = buildValidCharacterPayload(overrides);
  delete base.notes;
  return base;
}

export function buildInvalidCharacterPayload(
  field: CharacterInvalidField,
  invalidType: string
): unknown {
  const base = buildValidCharacterPayload();

  // 1) missing = removemos el campo
  if (invalidType === "missing") {
    const { [field]: _removed, ...rest } = base as any;
    return rest;
  }

  // 2) para el resto de casos, pedimos un inválido según tipo de campo
  const kind = characterFieldKind[field];
  const invalidValue = buildInvalidFieldValue(kind, invalidType);

  return {
    ...base,
    [field]: invalidValue,
  };
}