import type { APIRequestContext } from '@playwright/test'

export type HealthResponse = {
  status: string
  service: string
}

export class HealthApi {
  constructor(private readonly api: APIRequestContext) {}

  async getHealth(): Promise<HealthResponse> {
    const res = await this.api.get('/health')
    const body = (await res.json()) as HealthResponse
    return body
  }
}
