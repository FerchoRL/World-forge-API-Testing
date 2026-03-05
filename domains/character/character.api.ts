import type { APIRequestContext, APIResponse } from '@playwright/test'
import { Status } from '../../contracts/common/status'
import { CategoryName, CharacterId } from './character.types'

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
    id: CharacterId
    name: string
    status: Status
    categories: CategoryName[]
    identity: string
    inspirations: string[]
    notes?: string
    image?: string
}

export type CreateCharacterInput = {
    name: string
    status: 'DRAFT' | 'ACTIVE'
    categories: CategoryName[]
    identity: string
    inspirations: string[]
    notes?: string
    image?: string
}

export type CreateCharacterRequest = Omit<CreateCharacterInput, 'status'> & {
    status?: CreateCharacterInput['status']
}

export type UpdateCharacterCoreInput = {
    name?: string
    identity?: string
    categories?: CategoryName[]
    inspirations?: string[]
    notes?: string
    image?: string
}

export type ChangeCharacterStatusRequest = {
    status: 'ACTIVE' | 'ARCHIVED'
}

export type CreateCharacterResponse = {
    character: CharacterDTO
}

export type ChangeCharacterStatusResponse = {
    character: CharacterDTO
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

    // Método para listar personajes, con soporte opcional de paginación y filtros
    async listCharacters(params?: {
        page?: number | string;
        limit?: number | string;
        search?: string;
        status?: string;
    }): Promise<APIResponse> {
        const searchParams = new URLSearchParams()

        if (params?.page !== undefined) searchParams.set('page', String(params.page))
        if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
        if (params?.search !== undefined) searchParams.set('search', String(params.search))
        if (params?.status !== undefined) searchParams.set('status', String(params.status))

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
    async createCharacter(character: CreateCharacterRequest): Promise<APIResponse> {
        return this.api.post('/characters', {
            data: character,
        })
    }

    // Método para actualizar un personaje existente (PATCH parcial)
    async updateCharacter(id: string, updates: UpdateCharacterCoreInput): Promise<APIResponse> {
        return this.api.patch(`/characters/${id}`, {
            data: updates,
        })
    }

    // Método para cambiar el status de un personaje (acción de dominio)
    async changeCharacterStatus(id: string, body: ChangeCharacterStatusRequest): Promise<APIResponse> {
        return this.api.patch(`/characters/${id}/status`, {
            data: body,
        })
    }

}