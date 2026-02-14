// invalid-value.factory.ts

export type FieldKind = "string" | "array";

/**
 * Devuelve un valor inválido PARA un tipo de campo.
 * - fieldKind="string": invalidaciones típicas para strings
 * - fieldKind="array": invalidaciones típicas para arrays
 *
 * Nota: "empty" depende del fieldKind:
 * - string -> ""
 * - array  -> []
 */
export function buildInvalidFieldValue(fieldKind: FieldKind, type: string): unknown {
  if (type === "missing") {
    throw new Error(`"missing" no es un valor, es una operación (remover field). Manejarlo fuera.`);
  }

  if (fieldKind === "string") {
    switch (type) {
      case "empty":
        return "";
      case "invalidEnum":
        return "ILEGAL";
      case "spaces":
        return "       ";
      case "null":
        return null;
      case "booleanFalse":
        return false;
      case "booleanTrue":
        return true;
      case "number":
        return 123;
      case "array":
        return [];
      default:
        throw new Error(`Unsupported invalid value type for string: ${type}`);
    }
  }

  // fieldKind === "array"
  switch (type) {
    case "empty":
      return [];
    case "null":
      return null;
    case "booleanFalse":
      return false;
    case "booleanTrue":
      return true;
    case "number":
      return 123;
    case "string":
      return "invalid"; // rompe el tipo, no es array
    case "spaces":
      return "   "; // opcional: también rompe tipo
    default:
      throw new Error(`Unsupported invalid value type for array: ${type}`);
  }
}
