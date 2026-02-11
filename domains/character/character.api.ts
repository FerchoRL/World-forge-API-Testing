import type { APIRequestContext, APIResponse } from '@playwright/test'

export type CharacterDTO = {
    id: string
    name: string
    status: string
    categories: string[]
    identity: string
    inspirations: string[]
    notes?: string
}

export type ListCharactersResponse = {
    characters: CharacterDTO[]
    page: number
    limit: number
    total: number
}

export type GetCharacterByIdResponse = {
    character: CharacterDTO
}

/**
 * CharacterApi
 *
 * Cliente de API (POM) para el dominio Character.
 * 
 * Responsabilidades:
 * - Centralizar llamadas HTTP relacionadas con /characters
 * - Evitar que los steps conozcan URLs o query params
 * - Facilitar reutilización en list, get-by-id, create, update, etc.
 */

export class CharacterApi {
    // Contexto HTTP ya configurado (baseURL, headers)
    constructor(private readonly api: APIRequestContext) { }

    // Método para listar personajes, con soporte opcional de paginación
    async listCharacters(params?: { page?: number | string; limit?: number | string }): Promise<APIResponse> {
        const searchParams = new URLSearchParams()

        if (params?.page !== undefined) searchParams.set('page', String(params.page))
        if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))

        const url = searchParams.size > 0
            ? `/characters?${searchParams.toString()}`
            : `/characters`

        return this.api.get(url)
    }

    // Método para obtener un personaje por ID
    async getCharacterById(id: string): Promise<APIResponse> {
        return this.api.get(`/characters/${id}`)
    }
}