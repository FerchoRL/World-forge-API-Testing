import dotenv from 'dotenv'
import { request, type APIRequestContext } from '@playwright/test'

dotenv.config()

export async function createApiContext(): Promise<APIRequestContext> {
  const baseURL = process.env.BASE_URL

  if (!baseURL) {
    throw new Error(
      'BASE_URL is not defined. Create a .env file in the project root with BASE_URL=http://localhost:3001'
    )
  }

  return await request.newContext({
    baseURL,
    extraHTTPHeaders: { 'Content-Type': 'application/json' }
  })
}
