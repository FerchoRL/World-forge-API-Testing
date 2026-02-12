/**
 * Estados válidos para entidades editables del sistema
 * (Character, Universe, Location, etc.)
 */
export const VALID_STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

export type Status = typeof VALID_STATUSES[number];
