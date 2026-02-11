import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./tests",

  timeout: 30_000,

  forbidOnly: !!process.env.CI,

  retries: 0,

  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/playwright-report.json" }],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  },
});
