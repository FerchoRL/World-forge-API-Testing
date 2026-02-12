import type { CharacterDTO } from "../character.api";
import type { Status } from "../../../contracts/common/status";
import type { CategoryName } from "../character.types";

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

type CreateCharacterPayload = Omit<CharacterDTO, "id">;

/**
 * Payload base válido.
 */
export function buildValidCharacterPayload(
  overrides?: Partial<CreateCharacterPayload>
): CreateCharacterPayload {
  return {
    name: "Airi Kurogane",
    status: "ACTIVE" as Status,
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
