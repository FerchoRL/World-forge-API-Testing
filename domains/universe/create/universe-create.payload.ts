import type { CreateUniverseInput } from "../universe.api";
import { generateUniverseName } from "../universe-name.generator";
import {
  buildInvalidFieldValue,
  type FieldKind,
} from "../../../tests/shared/test-data/invalid-value.factory";

type CreateUniversePayload = CreateUniverseInput & {
  status?: CreateUniverseInput["status"];
};

type UniverseInvalidField =
  | "name"
  | "status"
  | "premise"
  | "rules"
  | "notes";

const universeFieldKind: Record<UniverseInvalidField, FieldKind> = {
  name: "string",
  status: "string",
  premise: "string",
  rules: "array",
  notes: "string",
};

export function buildValidUniversePayload(
  overrides?: Partial<CreateUniversePayload>
): CreateUniversePayload {
  return {
    name: generateUniverseName(),
    status: "ACTIVE",
    premise:
      "Un multiverso fracturado en el que cada reino protege una reliquia capaz de alterar la memoria colectiva.",
    rules: [
      "La magia exige un costo emocional proporcional al efecto",
      "Ningún viajero puede alterar su línea de origen",
      "Los pactos entre reinos solo se sellan durante eclipses"
    ],
    notes:
      "Universo orientado a conflictos políticos y exploración de identidad.",
    ...overrides,
  };
}

export function buildDraftUniversePayload(
  overrides?: Partial<CreateUniversePayload>
): CreateUniversePayload {
  return buildValidUniversePayload({
    status: "DRAFT",
    ...overrides,
  });
}

export function buildUniverseWithoutRules(
  overrides?: Partial<CreateUniversePayload>
): CreateUniversePayload {
  const base = buildValidUniversePayload(overrides);
  delete base.rules;
  return base;
}

export function buildUniverseWithoutNotes(
  overrides?: Partial<CreateUniversePayload>
): CreateUniversePayload {
  const base = buildValidUniversePayload(overrides);
  delete base.notes;
  return base;
}

export function buildInvalidUniversePayload(
  field: UniverseInvalidField,
  invalidType: string,
  options?: { invalidValue?: unknown }
): unknown {
  const base = buildValidUniversePayload();

  if (invalidType === "missing") {
    const { [field]: _removed, ...rest } = base as any;
    return rest;
  }

  const kind = universeFieldKind[field];
  const invalidValue =
    options?.invalidValue ?? buildInvalidFieldValue(kind, invalidType);

  return {
    ...base,
    [field]: invalidValue,
  };
}
