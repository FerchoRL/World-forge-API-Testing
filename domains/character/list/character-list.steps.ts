import { Given, When, Then, AfterAll } from '@cucumber/cucumber'
import { expect, type APIResponse } from '@playwright/test'
import { createCharacterContext, disposeCharacterContext, type CharacterContext } from '../character.context'
import type { ListCharactersResponse } from '../character.api'

let ctx: CharacterContext
let response: APIResponse
let responseBody: ListCharactersResponse

Given('the Character service is available', async () => {
    // En API testing esto es “setup”: creamos el contexto para usar el servicio
    ctx = await createCharacterContext()
})

When('I request the list of characters without pagination parameters', async () => {
    response = await ctx.characterApi.listCharacters()
    responseBody = (await response.json()) as ListCharactersResponse
})

Then('the response should contain the default pagination values for character list', async () => {
    expect(response.status()).toBe(200)

    expect(responseBody.page).toBe(1)
    expect(responseBody.limit).toBe(10)

    expect(Array.isArray(responseBody.characters)).toBe(true)
    expect(typeof responseBody.total).toBe('number')
})

AfterAll(async () => {
    await disposeCharacterContext(ctx)
})
