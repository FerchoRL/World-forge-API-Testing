import type { APIRequestContext, APIResponse } from '@playwright/test'
import { Status } from '../../contracts/common/status'
import { CategoryName } from './character.types'

/**
 * ===============================
 * Character — HTTP Layer (Automation)
 * ===============================
 *
 * Este archivo define:
 *
 * 1) DTOs que representan exactamente el contrato HTTP expuesto por el backend.
 * 2) El API Client (POM) para interactuar con /characters.
 *
 * Reglas importantes:
 *
 * - Los DTOs reflejan el contrato externo (API), NO el modelo interno del test.
 * - No deben compararse directamente contra documentos de base de datos.
 * - Las transformaciones API → Modelo interno se realizan en character.mapper.ts.
 *
 * Separación de responsabilidades:
 *
 * - character.api.ts     → Contrato HTTP + cliente
 */

export type CharacterDTO = {
    id: string
    name: string
    status: Status
    categories: CategoryName[]
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

    // Metodo para crear un nuevo personaje
    async createCharacter(character: Omit<CharacterDTO, 'id'>): Promise<APIResponse> {
        return this.api.post('/characters', {
            data: character,
        })
    }   

}