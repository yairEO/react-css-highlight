import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createCompareHighlight } from "../src/index";
import "../src/Highlight.css";

const box = {
  root: { maxWidth: 520, fontFamily: "system-ui, sans-serif" } as const,
  lead: { margin: "0 0 12px", fontSize: 14, lineHeight: 1.5 } as const,
  meta: { margin: "0 0 8px", fontSize: 13 } as const,
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } as const,
  panel: {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    minHeight: 56,
    padding: 12,
  } as const,
  editable: { outlineOffset: 2 } as const,
  hint: { marginTop: 12, fontSize: 12, opacity: 0.75 } as const,
  /** Outline only so Storybook viewers see per-word wrappers; unrelated to highlighting. */
  wordChunk: {
    outline: "1px dotted #cbd5e1",
    outlineOffset: 2,
    borderRadius: 2,
  } as const,
};

function setDiffText(ref: React.RefObject<HTMLSpanElement | null>, count: number) {
  const el = ref.current;
  if (el) el.textContent = String(count);
}

/** Two DOM roots: `highlight-diff-base` (left) vs `highlight-diff-compare` (right). */
function TwoElementsDemo() {
  const baseRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const base = baseRef.current;
    const compare = compareRef.current;
    if (!base || !compare) return;

    const ctrl = createCompareHighlight(base, compare, {
      onDiffChange: (c) => setDiffText(diffRef, c),
      onError: (err) => console.warn("Compare story:", err.message),
    });
    return () => ctrl.destroy();
  }, []);

  return (
    <div style={box.root}>
      <p style={box.lead}>
        Compares two elements’ flattened text character-by-character. Mismatches show as
        <code style={{ marginInline: 4 }}>::highlight(highlight-diff-base)</code>
        on the left (reference) and
        <code style={{ marginInline: 4 }}>::highlight(highlight-diff-compare)</code>
        on the right; no markup is injected.
      </p>
      <p style={box.meta}>
        Differing positions: <span ref={diffRef} style={{ fontWeight: 700 }}>0</span>
      </p>
      <div style={box.grid}>
        <div ref={baseRef} style={box.panel}>
          Hello, world.
        </div>
        <div ref={compareRef} style={box.panel}>
          Hello, kitty.
        </div>
      </div>
      <p style={box.hint}>Positional diff; base left, modified right.</p>
    </div>
  );
}

/** Same strings as TwoElements, but each word lives in its own element (multiple text nodes). */
function WordsInSeparateNodesDemo() {
  const baseRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const base = baseRef.current;
    const compare = compareRef.current;
    if (!base || !compare) return;

    const ctrl = createCompareHighlight(base, compare, {
      onDiffChange: (c) => setDiffText(diffRef, c),
      onError: (err) => console.warn("Compare story:", err.message),
    });
    return () => ctrl.destroy();
  }, []);

  return (
    <div style={box.root}>
      <p style={box.lead}>
        Same compare as TwoElements (“Hello, world.” vs “Hello, kitty.”), but each word is wrapped
        in its own inline node. Flattened text—and the positional diff—is unchanged; highlights
        are still clipped to real text-node ranges (dotted outlines only illustrate where words sit
        in the DOM).
      </p>
      <p style={box.meta}>
        Differing positions: <span ref={diffRef} style={{ fontWeight: 700 }}>0</span>
      </p>
      <div style={box.grid}>
        <div ref={baseRef} style={box.panel}>
          <span style={box.wordChunk}>Hello,</span> <span style={box.wordChunk}>world.</span>
        </div>
        <div ref={compareRef} style={box.panel}>
          <span style={box.wordChunk}>Hallo,</span> <span style={box.wordChunk}>kitty.</span>
        </div>
      </div>
      <p style={box.hint}>Diff count matches TwoElements; paint splits across spans as needed.</p>
    </div>
  );
}

/** Fixed reference string vs one live subtree (highlights DOM only). */
function StringVsElementDemo() {
  const liveRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const live = liveRef.current;
    if (!live) return;

    const ctrl = createCompareHighlight("Hello, world.", live, {
      onDiffChange: (c) => setDiffText(diffRef, c),
      onError: (err) => console.warn("Compare story:", err.message),
    });
    const onInput = () => ctrl.refresh();
    live.addEventListener("input", onInput);
    return () => {
      live.removeEventListener("input", onInput);
      ctrl.destroy();
    };
  }, []);

  return (
    <div style={box.root}>
      <p style={box.lead}>
        "Reference" is a plain string (expected text without its own DOM). Only the editable
        element is painted—the string participates in counting diffs but has no ranges to highlight.
      </p>
      <p style={box.meta}>
        Reference: <code>Hello, world.</code>
      </p>
      <p style={box.meta}>
        Differing positions: <span ref={diffRef} style={{ fontWeight: 700 }}>0</span>
      </p>
      <div
        ref={liveRef}
        contentEditable
        suppressContentEditableWarning
        style={{ ...box.panel, ...box.editable }}
      >
        Hello, kitty.
      </div>
      <p style={box.hint}>Edit box; refresh on input.</p>
    </div>
  );
}

const meta = {
  title: "Compare/Positional diff",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Character-level positional compare via `createCompareHighlight` (DOM and/or string). " +
          "See README: String comparison (positional diff).",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoElements: Story = {
  render: () => <TwoElementsDemo />,
};

export const WordsInSeparateNodes: Story = {
  render: () => <WordsInSeparateNodesDemo />,
};

export const StringVsElement: Story = {
  render: () => <StringVsElementDemo />,
};
