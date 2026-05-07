import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type CompareController,
  type CustomDiffResult,
  createCompareHighlight,
  type DiffFn,
  type DiffRange,
  positionalDiffFn,
} from "../src/index";
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
  toolbar: {
    display: "flex",
    gap: 8,
    margin: "0 0 12px",
    flexWrap: "wrap",
  } as const,
  algoBtn: {
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 13,
    background: "#fff",
    cursor: "pointer",
  } as const,
  algoBtnActive: {
    background: "#0f172a",
    color: "#fff",
    borderColor: "#0f172a",
  } as const,
  callout: {
    margin: "0 0 12px",
    padding: 10,
    fontSize: 12.5,
    lineHeight: 1.5,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
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

/**
 * Char-level LCS diff via DP table + backtrack — quadratic time/space, fine for short
 * demo strings (<~1k chars). Production code should pull in `fast-diff` /
 * `diff-match-patch` (Myers, ~linear) instead. Kept inline here so the example has
 * zero deps and you can read the full `DiffFn` contract end-to-end.
 *
 * Edit script: `equal` skipped, `delete` → baseRanges, `insert` → compareRanges.
 * Adjacent same-kind ops are coalesced into single ranges as we walk forward.
 */
const lcsDiffFn: DiffFn = (baseText, compareText): CustomDiffResult => {
  const n = baseText.length;
  const m = compareText.length;

  // dp[i][j] = LCS length of baseText[0..i) vs compareText[0..j)
  const dp: Uint16Array[] = [];
  for (let i = 0; i <= n; i++) dp.push(new Uint16Array(m + 1));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        baseText.charCodeAt(i - 1) === compareText.charCodeAt(j - 1)
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  type Op = "eq" | "del" | "ins";
  const ops: Op[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (baseText.charCodeAt(i - 1) === compareText.charCodeAt(j - 1)) {
      ops.push("eq");
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push("del");
      i--;
    } else {
      ops.push("ins");
      j--;
    }
  }
  while (i-- > 0) ops.push("del");
  while (j-- > 0) ops.push("ins");
  ops.reverse();

  const baseRanges: DiffRange[] = [];
  const compareRanges: DiffRange[] = [];
  let bi = 0;
  let ci = 0;
  let edits = 0;

  for (const op of ops) {
    if (op === "eq") {
      bi++;
      ci++;
      continue;
    }
    edits++;
    if (op === "del") {
      const last = baseRanges[baseRanges.length - 1];
      if (last && last.end === bi) last.end++;
      else baseRanges.push({ start: bi, end: bi + 1 });
      bi++;
    } else {
      const last = compareRanges[compareRanges.length - 1];
      if (last && last.end === ci) last.end++;
      else compareRanges.push({ start: ci, end: ci + 1 });
      ci++;
    }
  }

  return { baseRanges, compareRanges, diffCount: edits };
};

type Algo = "positional" | "lcs";

const ALGOS: { id: Algo; label: string; fn: DiffFn; unit: string }[] = [
  { id: "positional", label: "Positional", fn: positionalDiffFn, unit: "differing positions" },
  { id: "lcs", label: "LCS (edit-script)", fn: lcsDiffFn, unit: "edit operations" },
];

/**
 * Toggle the `diff` option live via `ctrl.update({ diff })`. Same DOM, same
 * controller — just swap the algorithm and the visual diff transforms. Try
 * inserting a word in the middle of the compare side: positional paints
 * everything downstream, LCS paints only the inserted region.
 */
function CustomDiffDemo() {
  const baseRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLSpanElement>(null);
  const ctrlRef = useRef<CompareController | null>(null);
  const [algo, setAlgo] = useState<Algo>("positional");

  useEffect(() => {
    const base = baseRef.current;
    const compare = compareRef.current;
    if (!base || !compare) return;

    const ctrl = createCompareHighlight(base, compare, {
      onDiffChange: (c) => setDiffText(diffRef, c),
      onError: (err) => console.warn("Compare story:", err.message),
    });
    ctrlRef.current = ctrl;

    const onInput = () => ctrl.refresh();
    compare.addEventListener("input", onInput);

    return () => {
      compare.removeEventListener("input", onInput);
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const found = ALGOS.find((a) => a.id === algo);
    if (found) ctrlRef.current?.update({ diff: found.fn });
  }, [algo]);

  const active = ALGOS.find((a) => a.id === algo) ?? ALGOS[0];

  return (
    <div style={box.root}>
      <p style={box.lead}>
        Live algorithm swap via <code>ctrl.update(&#123; diff &#125;)</code>. The default
        positional diff compares index-by-index — any insertion shifts every downstream
        position into the diff. An LCS-based edit-script aligns equal substrings and
        paints only the actual insertions / deletions.
      </p>
      <div style={box.callout}>
        <strong>Try it:</strong> click into the right panel and insert a word near the
        start (e.g. type <code>"dear "</code> after the comma). Toggle algorithms — the
        same edit looks dramatically different.
      </div>
      <div style={box.toolbar} role="radiogroup" aria-label="Diff algorithm">
        {ALGOS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={algo === a.id}
            onClick={() => setAlgo(a.id)}
            style={{
              ...box.algoBtn,
              ...(algo === a.id ? box.algoBtnActive : {}),
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
      <p style={box.meta}>
        Algorithm: <code>{active.label}</code> &middot;{" "}
        <span ref={diffRef} style={{ fontWeight: 700 }}>
          0
        </span>{" "}
        {active.unit}
      </p>
      <div style={box.grid}>
        <div ref={baseRef} style={box.panel}>
          Hello, world!
        </div>
        <div
          ref={compareRef}
          contentEditable
          suppressContentEditableWarning
          style={{ ...box.panel, ...box.editable }}
        >
          Hello, dear world!
        </div>
      </div>
      <p style={box.hint}>
        Left = base (reference). Right = compare (editable). Switching the algorithm
        triggers a recompute via <code>COMPARE_RECOMPUTE_KEYS</code>.
      </p>
    </div>
  );
}

const meta = {
  title: "Compare",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Character-level positional compare via `createCompareHighlight` (DOM and/or string), " +
          "plus pluggable `diff` option for LCS / Myers / custom edit-script algorithms. " +
          "See README: String comparison (positional diff) and Custom diff algorithms.",
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

export const CustomDiffAlgorithm: Story = {
  name: "Custom diff (Positional vs LCS)",
  render: () => <CustomDiffDemo />,
};
