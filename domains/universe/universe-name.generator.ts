export function generateUniverseName(): string {
  const random = Math.random().toString(36).slice(2, 8)
  return `Universe ${Date.now()}-${random}`
}
