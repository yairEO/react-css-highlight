import fs from "node:fs";
import path from "node:path";

export type VisualStoryEntry = {
  id: string;
  name: string;
  title: string;
  tags: string[];
  exportName: string;
};

type IndexEntry = {
  type?: string;
  subtype?: string;
  id: string;
  name: string;
  title: string;
  tags?: string[];
  exportName?: string;
};

type StorybookIndex = {
  entries?: Record<string, IndexEntry>;
};

export function resolveStorybookIndexPath(): string {
  return path.resolve(process.cwd(), "storybook-static/index.json");
}

export function discoverVisualStories(
  indexPath = resolveStorybookIndexPath(),
): VisualStoryEntry[] {
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Storybook index not found at ${indexPath}. Build Storybook first (build-storybook).`,
    );
  }

  const index = JSON.parse(fs.readFileSync(indexPath, "utf8")) as StorybookIndex;
  if (index.entries == null || typeof index.entries !== "object") {
    throw new Error(
      `Unrecognized Storybook index at ${indexPath}. Expected an "entries" object. Rebuild with build-storybook.`,
    );
  }

  const entries = Object.values(index.entries);

  const visualStories = entries
    .filter(
      (entry) =>
        entry.type === "story" &&
        (entry.subtype === undefined || entry.subtype === "story") &&
        (entry.tags ?? []).includes("visual"),
    )
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      title: entry.title,
      tags: entry.tags ?? [],
      exportName: entry.exportName ?? entry.name,
    }));

  if (visualStories.length === 0) {
    throw new Error(
      `No stories tagged "visual" in ${indexPath}. Add tags: ["visual"] on story exports.`,
    );
  }

  return visualStories;
}
