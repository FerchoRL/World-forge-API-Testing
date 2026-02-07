import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  testDir: './tests',

  timeout: 30_000,

  forbidOnly: !!process.env.CI,

  retries: 0,

  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  }
})
