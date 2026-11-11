import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test/browser',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.STOREFRONT_TEST_ORIGIN || 'http://localhost:5173',
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  reporter: 'list',
})
