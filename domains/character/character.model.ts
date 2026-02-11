/**
 * ===============================
 * Character — Test Model
 * ===============================
 *
 * Modelo interno usado por los tests para realizar assertions.
 *
 * Este modelo:
 * - NO es el DTO HTTP
 * - NO es el documento Mongo
 * - Representa la forma canónica contra la que comparamos datos
 */

export type CharacterModel = {
  id: string;
  name: string;
  status: string;
  categories: string[];
  identity: string;
  inspirations: string[];
  notes?: string;
};