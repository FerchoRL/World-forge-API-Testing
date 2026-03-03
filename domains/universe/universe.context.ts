import type { APIRequestContext } from '@playwright/test'
import { createApiContext } from '../../utils/http/apiContext'
import { UniverseApi } from './universe.api'

export type UniverseContext = {
	apiContext: APIRequestContext
	universeApi: UniverseApi
}

export async function createUniverseContext(): Promise<UniverseContext> {
	const apiContext = await createApiContext()
	const universeApi = new UniverseApi(apiContext)

	return { apiContext, universeApi }
}

export async function disposeUniverseContext(ctx?: UniverseContext): Promise<void> {
	await ctx?.apiContext?.dispose()
}
