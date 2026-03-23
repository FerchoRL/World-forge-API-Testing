import type { APIRequestContext, APIResponse } from '@playwright/test'
import { Status } from '../../contracts/common/status'
import type { UniverseId } from './universe.types'

/**
 * ===============================
 * Universe — HTTP Layer (Automation)
 * ===============================
 */

export type UniverseDTO = {
	id: UniverseId
	name: string
	status: Status
	premise: string
	rules?: string[]
	notes?: string
}

export type CreateUniverseInput = {
	name: string
	status: 'DRAFT' | 'ACTIVE'
	premise: string
	rules?: string[]
	notes?: string
}

export type CreateUniverseRequest = Omit<CreateUniverseInput, 'status'> & {
	status?: CreateUniverseInput['status']
}

export type UpdateUniverseCoreInput = {
	name?: string
	premise?: string
	rules?: string[]
	notes?: string
}

export type ChangeUniverseStatusRequest = {
	status: 'ACTIVE' | 'ARCHIVED'
}

export type CreateUniverseResponse = {
	universe: UniverseDTO
}

export type ChangeUniverseStatusResponse = {
	universe: UniverseDTO
}

export type ListUniversesResponse = {
	universes: UniverseDTO[]
	page: number
	limit: number
	total: number
}

export type GetUniverseByIdResponse = {
	universe: UniverseDTO
}

export class UniverseApi {
	constructor(private readonly api: APIRequestContext) {}

	async listUniverses(params?: { page?: number | string; limit?: number | string; search?: string; status?: string }): Promise<APIResponse> {
		const searchParams = new URLSearchParams()

		if (params?.page !== undefined) searchParams.set('page', String(params.page))
		if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
		if (params?.search !== undefined) searchParams.set('search', params.search)
		if (params?.status !== undefined) searchParams.set('status', params.status)

		const url = searchParams.size > 0
			? `/universes?${searchParams.toString()}`
			: `/universes`

		return this.api.get(url)
	}

	async getUniverseById(id: UniverseId): Promise<APIResponse> {
		return this.api.get(`/universes/${id}`)
	}

	async createUniverse(universe: CreateUniverseRequest): Promise<APIResponse> {
		return this.api.post('/universes', {
			data: universe,
		})
	}

	async createUniverseFromArchived(id: UniverseId): Promise<APIResponse> {
		return this.api.post(`/universes/${id}/create-from-archived`)
	}

	async updateUniverse(id: UniverseId, updates: UpdateUniverseCoreInput): Promise<APIResponse> {
		return this.api.patch(`/universes/${id}`, {
			data: updates,
		})
	}

	async changeUniverseStatus(id: UniverseId, body: ChangeUniverseStatusRequest): Promise<APIResponse> {
		return this.api.patch(`/universes/${id}/status`, {
			data: body,
		})
	}
}
