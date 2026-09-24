import { expect, test } from "@playwright/test";
import { discoverVisualStories } from "./discoverVisualStories";

const visualStories = discoverVisualStories();

const VISUAL_FIXED_TIME = new Date("2026-08-01T12:00:00Z");

const DISABLE_ANIMATIONS_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`;

type VisualViewport = {
  width: number;
  height: number;
};

function parseVisualViewport(value: string | null): VisualViewport | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as VisualViewport).width === "number" &&
      typeof (parsed as VisualViewport).height === "number" &&
      Number.isFinite((parsed as VisualViewport).width) &&
      Number.isFinite((parsed as VisualViewport).height) &&
      (parsed as VisualViewport).width > 0 &&
      (parsed as VisualViewport).height > 0
    ) {
      return parsed as VisualViewport;
    }
  } catch {
    return null;
  }

  return null;
}

test.describe("Storybook visual screenshots", () => {
  for (const story of visualStories) {
    test(story.id, async ({ page }) => {
      const url = `/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`;

      await page.clock.setFixedTime(VISUAL_FIXED_TIME);
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.locator("#storybook-root").waitFor({ state: "visible" });

      const viewport = parseVisualViewport(
        await page.locator("html").getAttribute("data-visual-viewport"),
      );
      if (viewport) {
        // Components that read window size at mount keep the old size unless
        // the iframe loads again after setViewportSize. Clock init survives reload.
        await page.setViewportSize(viewport);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.locator("#storybook-root").waitFor({ state: "visible" });
      }

      await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);

      const fullPage =
        (await page.locator("html").getAttribute("data-visual-full-page")) ===
        "true";

      const name = `${story.id}.png`;
      const screenshotOpts = { animations: "disabled" as const };

      if (fullPage) {
        await expect(page).toHaveScreenshot(name, {
          ...screenshotOpts,
          fullPage: true,
        });
      } else {
        await expect(page.locator("#storybook-root")).toHaveScreenshot(
          name,
          screenshotOpts,
        );
      }
    });
  }
});
