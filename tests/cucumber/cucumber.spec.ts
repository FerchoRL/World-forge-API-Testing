import { spawnSync } from 'child_process'
import { test } from '@playwright/test'

test('Run Cucumber features', () => {
  const result = spawnSync(
    'npx',
    ['cucumber-js', '--config', 'cucumber.config.js'],
    { stdio: 'inherit', shell: true }
  )

  if (result.status !== 0) {
    throw new Error('Cucumber tests failed')
  }
})
