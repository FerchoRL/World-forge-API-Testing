import { When, Then, AfterAll } from '@cucumber/cucumber'
import { expect, type APIRequestContext } from '@playwright/test'
import { createApiContext } from '../../utils/http/apiContext'
import { HealthApi, type HealthResponse } from './health.api'

let apiContext: APIRequestContext
let responseBody: HealthResponse

When('I check the health endpoint', async () => {
  apiContext = await createApiContext()
  const healthApi = new HealthApi(apiContext)
  responseBody = await healthApi.getHealth()
})

Then('the service should respond as healthy', async () => {
  expect(responseBody).toEqual({
    status: 'OK',
    service: 'world-forge'
  })
})

AfterAll(async () => {
  await apiContext?.dispose()
})
