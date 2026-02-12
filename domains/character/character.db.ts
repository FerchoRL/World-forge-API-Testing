/**
 * ===============================
 * Character — DB Layer (Mongo)
 * ===============================
 *
 * Representa exactamente cómo vive el documento en MongoDB.
 *
 * Reglas:
 * - Refleja la estructura real persistida.
 * - No contiene lógica.
 * - No es el DTO HTTP.
 * - No es el modelo interno de assertions.
 *
 * Fuente de verdad: colección Mongo real.
 */

import { Status } from "../../contracts/common/status";
import { CategoryName } from "./character.types";

export type CharacterMongoDocument = {
  _id: string; // char_xxxxx (no ObjectId)
  name: string;
  status: Status;
  categories: CategoryName[];
  identity: string;
  inspirations: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};
