import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Storybook visual screenshot tests (Linux Chromium).
 * Serve storybook-static separately. No webServer.
 * Run: pnpm test-storybook-visual
 *
 * channel: "chromium" opts into Chromium new headless (Playwright ≥ 1.49).
 * It is not Google Chrome. Snapshot names still use the project name
 * (`*-chromium-linux.png`).
 *
 * threshold is YIQ color distance (0–1), not a pixel ratio.
 * maxDiffPixels: 5 is strict on purpose.
 * timezoneId UTC so a laptop clock matches CI.
 */
export default defineConfig({
  testDir: "./e2e/storybook",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  passWithNoTests: false,
  reporter: process.env.GITHUB_ACTIONS
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : "list",
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      threshold: 0.05,
      maxDiffPixels: 5,
    },
  },
  use: {
    baseURL: process.env.STORYBOOK_URL || "http://127.0.0.1:6006",
    browserName: "chromium",
    headless: true,
    viewport: { width: 1280, height: 720 },
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "UTC",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chromium",
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
