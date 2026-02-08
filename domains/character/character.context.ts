import type { APIRequestContext } from '@playwright/test'
import { createApiContext } from '../../utils/http/apiContext'
import { CharacterApi } from './character.api'

/**
 * CharacterContext
 *
 * Representa el "mundo" necesario para testear Character.
 * 
 * Contiene:
 * - apiContext: conexión HTTP ya configurada (baseURL, headers, etc.)
 * - characterApi: cliente de API para operar sobre /characters
 *
 * Los steps NO deberían crear nada de esto directamente.
 */

export type CharacterContext = {
    apiContext: APIRequestContext
    characterApi: CharacterApi
}

export async function createCharacterContext(): Promise<CharacterContext> {
    const apiContext = await createApiContext()
    const characterApi = new CharacterApi(apiContext)

    return { apiContext, characterApi }
}

export async function disposeCharacterContext(ctx?: CharacterContext): Promise<void> {
    await ctx?.apiContext?.dispose()
}
