export type CucumberAttachWorld = {
  attach: (data: string, mediaType?: string) => unknown | Promise<unknown>
}

export async function attachJsonReport(world: CucumberAttachWorld, payload: unknown): Promise<void> {
  await world.attach(JSON.stringify(payload, null, 2), "application/json")
}
