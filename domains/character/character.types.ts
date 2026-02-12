/**
 * Categorías válidas para Character
 * Reflejan el contrato público del backend.
 */

export const VALID_CATEGORIES = [
  'PersonajeTrágico',
  'Protector',
  'Sobreviviente',
  'Mentor',
  'Oscuro',
  'Emocional',
  'Tranquilo',
  'Caótico',
  'Melancólico',
  'LealtadAbsoluta',
  'Dualidad',
  'Resiliencia',
  'AmorComoMotor',
  'Caida'
] as const;

export type CategoryName = typeof VALID_CATEGORIES[number];
