# React Text <mark>Highlight</mark> Component

> Modern, zero-dependency component for highlighting text using [CSS Custom Highlight](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::highlight) API

[![npm version](https://img.shields.io/npm/v/react-css-highlight?style=flat-square&logo=npm)](https://www.npmjs.com/package/react-css-highlight)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![CSS Highlight API](https://img.shields.io/badge/CSS-Highlights%20API-ff69b4?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)

<o align="center">
<kbd>
<img src="./react-css-highlight.apng"/>
</kbd>
</p>

## Live Demos

- **[Vanilla JS Demo](https://yaireo.github.io/react-css-highlight/vanilla-demo/)** - Pure JavaScript implementation (no framework)
- **[React Storybook](https://yaireo.github.io/react-css-highlight/)** - Interactive examples with all features
- **[Codesandbox demo](https://codesandbox.io/p/sandbox/sft3zr?file=%2Fsrc%2Findex.tsx)** - basic use cases

## ✨ Features

- **Blazing Fast** - No DOM mutiations! Uses `TreeWalker` for efficient DOM traversal (500× faster than naive approaches)
- **Non-Invasive** - Zero impact on your DOM structure or React component tree. The DOM is not mutated.
- **Non-Blocking** - Uses `requestIdleCallback` to prevent UI freezes during search operations
- **Fully Customizable** - Control highlights colors with simple CSS variables
- **Multi-Term Support** - Highlight multiple search terms simultaneously with different styles
- **Positional compare (markup-agnostic)** — `createCompareHighlight` diffs **flattened text** (every `#text` node under a root, in tree order). **How you wrap words in elements does not change the compared string**—only the actual characters do. Mismatches paint via the CSS Highlight API (`Range`s on those text nodes, `::highlight()` styles), not by injecting `<mark>` or forcing both sides to share the same HTML shape (vanilla / framework-agnostic)
- **Zero Dependencies** - Pure React + Modern Browser APIs
- **Multiple Usage Patterns** - React (ref-based/wrapper/hook) or vanilla JS (framework-agnostic)
- **TypeScript First** - Full type safety with extensive JSDoc documentation
- **Framework Agnostic** - Use with React, Vue, Svelte, Angular, or vanilla JavaScript
- **Clean Architecture** - React hook is a thin wrapper around framework-agnostic core


## 📖 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Patterns](#-usage-patterns)
  - [React Usage](#react-usage)
    - [Component (Ref-Based)](#1-component-ref-based)
    - [Wrapper (Simple)](#2-wrapper-simple)
    - [Hook (Maximum Control)](#3-hook-maximum-control)
  - [Vanilla JavaScript Usage](#vanilla-javascript-usage)
  - [String comparison (positional diff)](#string-comparison-positional-diff)
- [API Reference](#-api-reference)
- [Styling](#-styling)
- [Performance](#-performance)
- [Browser Support](#-browser-support)
- [Advanced Examples](#-advanced-examples)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 📦 Installation

Install via [npm](https://www.npmjs.com/package/react-css-highlight):

```bash
npm install react-css-highlight
```

Or using `pnpm`:

```bash
pnpm add react-css-highlight
```

Or using `yarn`:

```bash
yarn add react-css-highlight
```

## 🚀 Quick Start

### Basic Example

```tsx
import { useRef } from "react";
import Highlight from "react-css-highlight";

function SearchResults() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Highlight search="React" targetRef={contentRef} />
      <div ref={contentRef}>
        <p>React is a JavaScript library for building user interfaces.</p>
        <p>React makes it painless to create interactive UIs.</p>
      </div>
    </>
  );
}
```

**Result:** All instances of "React" will be highlighted with a yellow background.

## 📚 Usage Patterns

This library can be used in **React** or **vanilla JavaScript** (Vue, Svelte, Angular, etc.).

### React Usage

There are three ways to use this library in React, each suited for different scenarios:

### 1. Component (Ref-Based)

**Use when:**
- Multiple highlights on the same content
- Working with portals or complex layouts
- Need to highlight existing components
- Want zero performance overhead

```tsx
import { useRef } from "react";
import Highlight from "react-css-highlight";

function AdvancedSearch() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Multiple highlights with different styles */}
      <Highlight
        search="error"
        targetRef={contentRef}
        highlightName="highlight-error"
      />
      <Highlight
        search="warning"
        targetRef={contentRef}
        highlightName="highlight-warning"
      />

      <div ref={contentRef}>
        <p>Error: Connection failed</p>
        <p>Warning: High memory usage</p>
      </div>
    </>
  );
}
```

### 2. Wrapper (Simple)

**Use when:**
- Simple, single highlight needed
- Content is self-contained
- Want cleaner, simpler code

> **⚠️ Important:** The child element must be a **single React element that accepts a `ref` prop**. DOM elements (div, section, article, etc.) and most React components support this natively.

```tsx
import { HighlightWrapper } from "@/components/general/Highlight";

function SimpleSearch() {
  return (
    <HighlightWrapper search="important">
      <div>
        <p>This is an important message about important topics.</p>
      </div>
    </HighlightWrapper>
  );
}
```

**Valid children:**
```tsx
// ✅ DOM elements with ref support
<HighlightWrapper search="term"><div>Content</div></HighlightWrapper>
<HighlightWrapper search="term"><article>Content</article></HighlightWrapper>
<HighlightWrapper search="term"><section>Content</section></HighlightWrapper>

// ✅ Custom components with forwardRef (or ref prop in React 19)
const MyComponent = forwardRef((props, ref) => <div ref={ref} {...props} />);
<HighlightWrapper search="term"><MyComponent>Content</MyComponent></HighlightWrapper>

// ❌ Multiple elements
<HighlightWrapper search="term">
  <div>First</div>
  <div>Second</div>  {/* Error: must be single element */}
</HighlightWrapper>

// ❌ Non-element children
<HighlightWrapper search="term">
  Just plain text  {/* Error: not a React element */}
</HighlightWrapper>
```

When these requirements aren't met, use the [Component (Ref-Based)](#1-component-ref-based) pattern instead.

### 3. Hook (Maximum Control)

**Use when:**
- Building custom components or abstractions
- Need direct access to match count, error state, or browser support
- Want to control the entire render logic
- Integrating with complex state management

The `useHighlight` hook provides the same functionality as the `Highlight` component, but gives you direct access to the highlight state.

> **⚠️ Important:** When using the hook directly, you must import the CSS file somewhere in your project (typically in your main entry file or root component):
> ```tsx
> import "react-css-highlight/dist/Highlight.css";
> ```
> This only needs to be imported **once** per project, not in every file that uses the hook.

```tsx
import { useRef } from "react";
import { useHighlight } from "react-css-highlight";
// Note: CSS should be imported once in your app's entry point, not here

function CustomHighlightComponent() {
  const contentRef = useRef<HTMLDivElement>(null);

  const { matchCount, isSupported, error } = useHighlight({
    search: "React",
    targetRef: contentRef,
    highlightName: "highlight",
    caseSensitive: false,
    wholeWord: false,
    maxHighlights: 1000,
    debounce: 100,
    onHighlightChange: (count) => console.log(`Found ${count} matches`),
    onError: (err) => console.error("Highlight error:", err),
  });

  return (
    <div>
      {!isSupported && (
        <div className="warning">
          Your browser doesn't support CSS Custom Highlight API
        </div>
      )}

      {error && (
        <div className="error">
          Error: {error.message}
        </div>
      )}

      <div className="match-count">
        Found {matchCount} matches
      </div>

      <div ref={contentRef}>
        <p>React is a JavaScript library for building user interfaces.</p>
        <p>React makes it painless to create interactive UIs.</p>
      </div>
    </div>
  );
}
```

**Hook Return Value:**

| Property | Type | Description |
|----------|------|-------------|
| `matchCount`  | `number`          | Number of highlighted matches found
| `isSupported` | `boolean`         | Whether the browser supports CSS Custom Highlight API
| `error`       | `Error \| null`   | Error object if highlighting failed, null otherwise
| `refresh`     | `(search?: string | string[]) => void` | Manually trigger re-highlighting (useful for dynamic content) with optional new search term(s) to highlight

**When to use the hook vs component:**

- **Use the component** when you just need highlighting without additional UI logic
- **Use the hook** when you need to:
  - Display match counts in your UI
  - Show error messages to users
  - Conditionally render UI based on browser support
  - Build complex components that need highlight state
  - Integrate with form state or other React state management
  - Manually control re-highlighting for dynamic content (virtualized lists, infinite scroll, etc.)

---

### Vanilla JavaScript Usage

This library also provides a framework-agnostic API for use with Vue, Svelte, Angular, or vanilla JavaScript. Import from `react-css-highlight/vanilla` to use the `createHighlight()` function and utility APIs without React dependencies.

> **Requirements:** This package uses ES modules and requires a bundler (Vite, Webpack, Esbuild) or module system. It does not support plain `<script>` tags without a build tool.

📖 **[See Vanilla JS Documentation →](src/vanilla/README.md)**

### String comparison (positional diff)

Compare two sides’ **flattened text** character-by-character at each index (UTF-16 code units, aligned with concatenated text nodes). Each side can be an `HTMLElement` **or** a plain `string` (expected text / reference without a rendered node). Mismatched characters and tails when lengths differ show as highlights on **DOM** sides only (string sides have no `Range` to paint). When both sides are elements, default names are `highlight-diff-base` (reference) and `highlight-diff-compare` (modified). No DOM markup is injected; styling uses the same [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API) as search highlights.

**Why CSS highlights fit compare mode:** Decoration is **orthogonal to your component markup**. Whether the live content is one text node or split across many spans, links, or design-system wrappers, the walk still yields one logical string and the same positional diff; the engine then clips highlights to the underlying `#text` ranges. You avoid wrapping every differing character in new elements (and the reflow/reconciliation issues that brings in React), and you never need to “normalize” both trees to identical tag structure just to show a diff visual.

**Import once:** include styles so `::highlight(highlight-diff-base)` / `::highlight(highlight-diff-compare)` apply (for example `import "react-css-highlight/dist/Highlight.css"` or `import "react-css-highlight/styles"`).

```js
import { createCompareHighlight } from "react-css-highlight/vanilla";
import "react-css-highlight/styles";

const baseEl = document.getElementById("base");
const compareEl = document.getElementById("compare");
if (!baseEl || !compareEl) {
  throw new Error("Missing #base or #compare element");
}

const ctrl = createCompareHighlight(baseEl, compareEl, {
  onDiffChange(count) {
    console.log("Differing character positions:", count);
  },
});

// After edits (e.g. input on contenteditable), re-run comparison:
ctrl.refresh();

// Later:
ctrl.destroy();
```

Compare a fixed reference string to a live element (highlights only the element):

```js
const expected = "Hello, world";
const liveEl = document.getElementById("live");
if (!liveEl) throw new Error("Missing #live");

const ctrl = createCompareHighlight(expected, liveEl, {
  onDiffChange(count) {
    console.log("Differing character positions:", count);
  },
});

liveEl.addEventListener("input", () => ctrl.refresh());
```

Behavior notes:

- **Positional by default**, not Myers/LCS alignment: inserting text in one side shifts subsequent indices, so downstream regions may appear as entirely different unless strings stay the same length and prefix-identical where you care about alignment. Pass a custom [`diff` option](#custom-diff-algorithms-lcs--myers--word-line-level) to switch to edit-script alignment.
- **Whitespace counts:** flattened text includes all text nodes (including whitespace-only) so offsets stay stable.
- **String-side gotchas:** browser `textContent` normalizes line endings to `\n`. A Windows-style reference string like `"foo\r\nbar"` will show a positional diff for every `\r` when compared to equivalent DOM text — strip `\r` from your reference first. `<br>` elements contribute no characters to `textContent`; if your reference string uses `\n` where the DOM uses `<br>`, every newline is a diff — align formatting (e.g. match line breaks) or strip newlines from the string.
- **Timing:** Diff count updates **synchronously**; painting registers with `CSS.highlights` inside `requestIdleCallback` when at least one side is a DOM tree (same pattern as `createHighlight`). If **both** sides are strings, only the diff runs — no highlight registration is scheduled.

**Live example:** [Vanilla JS Demo](https://yaireo.github.io/react-css-highlight/vanilla-demo/) includes an interactive string-comparison block.

---

## 📋 API Reference

### `useHighlight` Hook

The `useHighlight` hook accepts the same options as the `Highlight` component and returns highlight state.

> **Note:** When using the hook directly, you must import the CSS file once in your project:
> ```tsx
> // In your main.tsx, App.tsx, or _app.tsx
> import "react-css-highlight/dist/Highlight.css";
> ```
> This is not needed when using the `Highlight` or `HighlightWrapper` components, as they import it automatically.

**Parameters:** Same as [`Highlight` Component Props](#highlight-component-props)

**Returns:** [`UseHighlightResult`](#usehighlightresult-type)

```tsx
import { useHighlight } from "react-css-highlight";
// CSS already imported in main entry file

const { matchCount, isSupported, error } = useHighlight({
  search: "term",
  targetRef: contentRef,
  highlightName: "highlight",
  caseSensitive: false,
  wholeWord: false,
  maxHighlights: 1000,
  debounce: 100,
  onHighlightChange: (count) => {},
  onError: (err) => {},
});
```

#### `UseHighlightResult` Type

| Property | Type | Description |
|----------|------|-------------|
| `matchCount` | `number` | Number of matches currently highlighted (updates synchronously) |
| `isSupported` | `boolean` | Whether browser supports CSS Custom Highlight API |
| `error` | `Error \| null` | Error object if highlighting failed, null otherwise |
| `refresh` | `(search?: string \| string[]) => void` | Manually trigger re-highlighting. Optionally pass search term(s) to temporarily highlight different content without updating component state |

### `Highlight` Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `search` | `string \| string[]` | **required** | Text to highlight (supports multiple terms). If array is passed, make sure it is memoed |
| `targetRef` | `RefObject<HTMLElement \| null>` | **required** | Ref to the element to search within |
| `highlightName` | `string` | `"highlight"` | CSS highlight name (use predefined styles from `Highlight.css`) |
| `caseSensitive` | `boolean` | `false` | Case-sensitive search |
| `wholeWord` | `boolean` | `false` | Match whole words only |
| `maxHighlights` | `number` | `1000` | Maximum highlights (performance limit) |
| `debounce` | `number` | `100` | Debounce delay in ms before updating highlights |
| `ignoredTags` | `string[]` | `undefeind` | HTML tags names whose text content should not be highlighted. These are merged with the default list of contentless ignored tags which is defined within the `constants` file
| `onHighlightChange` | `(count: number) => void` | `undefined` | Callback when highlights update |
| `onError` | `(error: Error) => void` | `undefined` | Error handler |

### `HighlightWrapper` Component Props

All `Highlight` props except `targetRef`, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Single React element that accepts a `ref` prop |

### Exported Constants

```tsx
import {
  DEFAULT_MAX_HIGHLIGHTS,  // 1000
  IGNORED_TAG_NAMES,       // ["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "TEXTAREA"]
  SLOW_SEARCH_THRESHOLD_MS // 100
} from "react-css-highlight";
```

### Exported Hooks

```tsx
import {
  useHighlight,  // Main highlight hook
  useDebounce    // Utility debounce hook
} from "react-css-highlight";
```

### `createCompareHighlight` (string comparison)

Framework-agnostic API for **positional** diff highlighting. Each argument is `HTMLElement | string`: use a string when you don’t have a rendered reference tree (only DOM sides paint). Also exported from `"react-css-highlight"` root for reuse in bundlers alongside React.

**Signature:**

```ts
createCompareHighlight(
  base: HTMLElement | string,
  compare: HTMLElement | string,
  options?: CompareOptions
): CompareController
```

Types: **`CompareInput`** = `HTMLElement | string`; **`CompareSource`** — resolved `{ kind: 'element'; element } | { kind: 'text'; text }`; read **`controller.sources`** (same object reference across reads).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseHighlightName` | `string` | `"highlight-diff-base"` | `::highlight()` name for mismatches mapped into the base side (ignored when base is a string) |
| `compareHighlightName` | `string` | `"highlight-diff-compare"` | `::highlight()` name for mismatches mapped into the compare side (ignored when compare is a string) |
| `ignoredTags` | `string[]` | (none extra) | Merged with built-in ignored tags; text under these parent tag names is skipped when flattening **element** sides only |
| `onDiffChange` | `(diffCount: number) => void` | — | Runs **after** each compare. Default unit = differing **character positions** (not contiguous ranges). With a custom `diff`, the unit is whatever your `DiffFn` returns. |
| `onError` | `(error: Error) => void` | — | Error handler |
| `diff` | `DiffFn` | `positionalDiffFn` | Pluggable diff. Override to use edit-script algorithms (LCS / Myers / Patience / Histogram) at any granularity. See [Custom diff algorithms](#custom-diff-algorithms-lcs--myers--word-line-level). |

**`CompareController`**

| Property / method | Type | Description |
|-------------------|------|-------------|
| `diffCount` | `number` | Differing character positions from the last synchronous compare |
| `sources` | `{ base: CompareSource; compare: CompareSource }` | Frozen view of the two sides; narrow on `kind` for `HTMLElement` vs string |
| `update` | `(options: Partial<CompareOptions>) => void` | Merge new options and re-run comparison |
| `refresh` | `() => void` | Re-run comparison with current DOM text (e.g. after `contenteditable` changes) |
| `destroy` | `() => void` | Clear highlights and cancel pending work |

If the browser does not support the CSS Custom Highlight API, `createCompareHighlight` returns a no-op controller and invokes `onError` when supplied. `base` and `compare` must be defined (not `null` / `undefined`); each must be a string or a valid `HTMLElement` (non-element values throw `INVALID_INPUT`). To change which element or string is compared after construction, `destroy()` the controller and create a new one.

### Custom diff algorithms (LCS / Myers / word-line level)

The default positional diff is great for typing-tutor style "did the user type the same characters?" UX, but breaks down for prose / code where a single insertion shifts every downstream index. Pass a custom `diff` function to swap in any edit-script algorithm at any granularity (char / word / line / token).

**Signatures:**

```ts
import type { DiffFn, CustomDiffResult, DiffRange } from "react-css-highlight";

type DiffRange = { start: number; end: number }; // half-open [start, end)

interface CustomDiffResult {
  baseRanges: DiffRange[];     // flat-text offsets into baseText (deletions live here)
  compareRanges: DiffRange[];  // flat-text offsets into compareText (insertions live here)
  diffCount: number;           // opaque to controller — emitted via onDiffChange
}

type DiffFn = (baseText: string, compareText: string) => CustomDiffResult;
```

**Contract:**

- Synchronous only. Throwing routes through `onError` and clears highlights.
- Out-of-bound ranges are clipped to each side's flat-text length by the range mapper, so off-by-one bugs degrade gracefully instead of crashing.
- Equal substrings should land in **neither** side's ranges. Edit-script algorithms naturally produce this: `equal` ops are skipped, `delete` ops add to `baseRanges`, `insert` ops add to `compareRanges`, `replace` ops add to both.
- `diffCount` is whatever you say it is — pick a unit that means something to your callers (positions, edit ops, hunks, words changed, …) and document it.

**Example: word-level diff via [`fast-diff`](https://github.com/jhchen/fast-diff):**

```js
import { createCompareHighlight, type DiffFn } from "react-css-highlight/vanilla";
import diff from "fast-diff";
import "react-css-highlight/styles";

const wordDiff: DiffFn = (baseText, compareText) => {
  const ops = diff(baseText, compareText); // [op, str][] where op ∈ {-1, 0, 1}

  const baseRanges = [];
  const compareRanges = [];
  let bi = 0;
  let ci = 0;
  let editOps = 0;

  for (const [op, str] of ops) {
    const len = str.length;
    if (op === diff.EQUAL) {
      bi += len;
      ci += len;
    } else if (op === diff.DELETE) {
      baseRanges.push({ start: bi, end: bi + len });
      bi += len;
      editOps++;
    } else {
      compareRanges.push({ start: ci, end: ci + len });
      ci += len;
      editOps++;
    }
  }

  return { baseRanges, compareRanges, diffCount: editOps };
};

const ctrl = createCompareHighlight(baseEl, compareEl, {
  diff: wordDiff,
  onDiffChange(count) {
    console.log("Edit operations:", count);
  },
});
```

**Replacing the diff later:**

```js
import { positionalDiffFn } from "react-css-highlight/vanilla";

ctrl.update({ diff: wordDiff });          // triggers recompute
ctrl.update({ diff: positionalDiffFn });  // back to positional default
```

> `update()` strips `undefined` values, so passing `diff: undefined` is a no-op. To revert to positional, pass the exported `positionalDiffFn` explicitly.

**Hybrid strategy** — positional for short inputs, edit-script for long:

```js
import { positionalDiffFn } from "react-css-highlight/vanilla";

const hybrid: DiffFn = (a, b) =>
  Math.max(a.length, b.length) < 200 ? positionalDiffFn(a, b) : wordDiff(a, b);
```

**Granularity tip:** `fast-diff`, `diff-match-patch`, etc. work at character level. To get word- or line-level alignment, tokenize first, run the algorithm on the token sequence, then rehydrate token boundaries back into character offsets when building `DiffRange[]`. The library doesn't ship tokenizers — bring your own (or accept char-level alignment, which is usually fine).

### Advanced comparison helpers

For custom integrations, the same functions used internally are exported from `"react-css-highlight"` and `"react-css-highlight/vanilla"`:

- `buildTextMap(element, ignoredTags?)` — flatten descendant text to a string plus per–text-node spans (includes whitespace-only nodes).
- `positionalDiff(baseText, compareText)` — pure string positional diff; returns grouped ranges and `diffCount`.
- `positionalDiffFn(baseText, compareText)` — same as `positionalDiff` adapted to the `DiffFn` shape (`{ baseRanges, compareRanges, diffCount }`); used as the default when no custom `diff` is supplied. Re-export it inside hybrid `DiffFn`s to fall back to positional on short strings.
- `mapDiffToRanges(diffRanges, textMap)` — turn flat ranges into `Range[]` clipped to the map's length.

## 🎨 Styling

### Default Styles

The component comes with pre-defined highlight styles that use CSS custom properties:

```css
::highlight(highlight) {
  background-color: var(--highlight-primary, #fef3c7);
  color: inherit;
}
```

### CSS Custom Properties

All highlight colors can be customized using CSS custom properties. Override these variables in your global stylesheet or component styles:

```css
:root {
  /* Primary highlight (default) */
  --highlight-primary: #fef3c7;    /* Light yellow */

  /* Secondary highlight */
  --highlight-secondary: #cffafe;  /* Sky blue */

  /* Success highlight */
  --highlight-success: #dcfce7;    /* Light green */

  /* Warning highlight */
  --highlight-warning: #fde68a;    /* Orange-yellow */

  /* Error highlight */
  --highlight-error: #ffccbc;      /* Light red */

  /* Active/focused highlight */
  --highlight-active: #fcd34d;     /* Dark yellow */
}
```

**String comparison (default theme):**

```css
:root {
  --highlight-diff-base: #fecaca;     /* Light red (base / reference) */
  --highlight-diff-compare: #bbf7d0;  /* Light green (compare / modified) */
}
```

**Example:** Customize colors to match your theme:

```css
:root {
  --highlight-primary: #e0f2fe;     /* Light blue */
  --highlight-success: #d1fae5;    /* Mint green */
  --highlight-error: #fee2e2;       /* Light pink */
}
```

### Pre-defined Style Variants

The component includes several pre-defined highlight styles:

```tsx
// Available variants
highlightName="highlight"           // Primary (default)
highlightName="highlight-primary"   // Yellow (#fef3c7)
highlightName="highlight-secondary" // Sky blue (#cffafe)
highlightName="highlight-success"   // Light green (#dcfce7)
highlightName="highlight-warning"   // Orange-yellow (#fde68a)
highlightName="highlight-error"     // Light red (#ffccbc)
highlightName="highlight-active"    // Dark yellow (#fcd34d), bold text
```

[String comparison](#string-comparison-positional-diff) uses two highlight layers: defaults `highlight-diff-base` and `highlight-diff-compare`, set via `baseHighlightName` / `compareHighlightName` on `createCompareHighlight`.

Create custom highlight styles by providing a `highlightName`:

```tsx
<Highlight
  search="error"
  targetRef={ref}
  highlightName="my-custom-highlight"
/>
```

```css
::highlight(my-custom-highlight) {
  background-color: #ff0000;
  color: white;
  text-decoration: underline wavy;
  font-weight: bold;
}
```

### Customizing String Comparison Colors

`createCompareHighlight` accepts `baseHighlightName` and `compareHighlightName` — same `::highlight()` name mechanism as the search component, applied to each side independently. Three ways to change the colors, pick whichever fits your style system:

#### Option 1 — Reuse a built-in variant

The pre-defined variants from the [previous section](#pre-defined-style-variants) (`highlight-primary`, `highlight-secondary`, `highlight-success`, `highlight-warning`, `highlight-error`, `highlight-active`) are valid `::highlight()` names. Point each side at the variant you want — zero CSS needed because `Highlight.css` already ships those rules.

```js
import { createCompareHighlight } from "react-css-highlight/vanilla";
import "react-css-highlight/styles";

createCompareHighlight(val1Ref.current, val2Ref.current, {
  baseHighlightName: "highlight-primary",     // yellow on the reference side
  compareHighlightName: "highlight-secondary", // sky blue on the modified side
});
```

#### Option 2 — Custom name + custom CSS

Pass any string. You're now responsible for defining a matching `::highlight(...)` rule somewhere in your stylesheet.

```js
createCompareHighlight(val1Ref.current, val2Ref.current, {
  baseHighlightName: "highlight-foo",
  compareHighlightName: "highlight-bar",
});
```

```css
::highlight(highlight-foo) {
  background-color: LightSalmon;
  color: inherit;
}

::highlight(highlight-bar) {
  background-color: PaleGreen;
  color: inherit;
  text-decoration: underline; /* ⚠️ unsupported in Firefox */
}
```

> The names don't need a `highlight-` prefix — `::highlight(my-diff-left)` works just as well. The prefix is only a convention used by the bundled stylesheet.

#### Option 3 — Keep default names, override CSS variables

Cheapest path if the only thing you want to change is the colors. Leaves `baseHighlightName` / `compareHighlightName` at their defaults (`highlight-diff-base` / `highlight-diff-compare`) and re-themes via custom properties:

```css
:root {
  --highlight-diff-base: #fde68a;    /* warm yellow on the reference side */
  --highlight-diff-compare: #c7d2fe; /* indigo on the modified side */
}
```

Or replace the rules entirely:

```css
::highlight(highlight-diff-base) {
  background-color: var(--highlight-diff-base, #fecaca);
  color: inherit;
}

::highlight(highlight-diff-compare) {
  background-color: var(--highlight-diff-compare, #bbf7d0);
  color: inherit;
}
```

#### Live updates

Changing names after construction is supported — the controller re-registers under the new names on the next compute cycle:

```js
ctrl.update({
  baseHighlightName: "highlight-warning",
  compareHighlightName: "highlight-success",
});
```

## ⚡ Performance

### Optimizations

- **Pre-compiled Regex** - Patterns compiled once per search (500× faster)
- **TreeWalker** - Native browser API for efficient DOM traversal
- **Early Exit** - Stops at `maxHighlights` limit
- **Empty Node Skipping** - Ignores whitespace-only text nodes
- **requestIdleCallback** - Non-blocking highlight styling to prevent UI freezes
- **Sync Match Count** - Match counts calculated synchronously, styling applied asynchronously
- **Performance Monitoring** - Dev-mode warnings for slow searches (>100ms)

### How It Works

The highlighting system uses a two-phase approach for optimal performance:

1. **Synchronous Phase** (immediate):
   - Calculates match count
   - Updates state
   - Calls `onHighlightChange` callback
   - Returns immediately to keep UI responsive

2. **Asynchronous Phase** (deferred):
   - Applies visual highlighting using CSS Custom Highlight API
   - Scheduled via `requestIdleCallback` during browser idle time
   - Prevents blocking user interactions

This means `matchCount` is always up-to-date immediately, while visual highlights appear shortly after without blocking the main thread.

### Performance Tips

```tsx
// ✅ Good - Single highlight with reasonable limit
<Highlight search="term" targetRef={ref} maxHighlights={500} />

// ✅ Good - Pre-filter search terms and memo the result
const toHighlight = useMemo(() => terms.filter(t => t.length > 2), [terms])

<Highlight
  search={toHighlight}
  targetRef={ref}
/>

// ⚠️ Caution - Many terms on huge documents and the array is not memoed
<Highlight
  search={[...100terms]}
  targetRef={ref}
  maxHighlights={5000} // Consider lowering
/>
```

## 🌐 Browser Support

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| **Chrome** | 105+ | ✅ Full support | |
| **Chrome Android** | 105+ | ✅ Full support | |
| **Edge** | 105+ | ✅ Full support | |
| **Firefox** | 140+ | ⚠️ Partial support | Cannot use with `text-decoration` or `text-shadow` |
| **Firefox Android** | 140+ | ⚠️ Partial support | Same limitations as desktop |
| **Safari** | 17.2+ | ⚠️ Full support* | Style ignored when combined with `user-select: none` ([WebKit bug 278455](https://webkit.org/b/278455)) |
| **Safari iOS** | 17.2+ | ⚠️ Full support* | Same limitation as desktop |
| **Opera** | 91+ | ✅ Full support | |
| **Opera Android** | 73+ | ✅ Full support | |
| **Samsung Internet** | 20+ | ✅ Full support | |
| **WebView Android** | 105+ | ✅ Full support | |

### Known Limitations

#### Firefox (v140+)
- ❌ **Cannot use** `text-decoration` (underline, overline, line-through)
- ❌ **Cannot use** `text-shadow`
- ✅ Other styling properties work (background-color, color, font-weight, etc.)

```css
/* ❌ Won't work in Firefox */
::highlight(my-highlight) {
  text-decoration: underline;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

/* ✅ Works in Firefox */
::highlight(my-highlight) {
  background-color: yellow;
  color: black;
  font-weight: bold;
}
```

#### Safari (v17.2+)
- ⚠️ Highlight style is **ignored** when the target element has `user-select: none`
- Workaround: Remove `user-select: none` from highlighted content

```css
/* ❌ Highlight won't appear in Safari */
.content {
  user-select: none;
}

/* ✅ Highlight works */
.content {
  user-select: auto; /* or remove the property */
}
```

### Feature Detection

The component automatically detects browser support:

```tsx
import { isHighlightAPISupported } from "react-css-highlight";

if (!isHighlightAPISupported()) {
  console.warn("Browser doesn't support CSS Custom Highlight API");
}
```

In development mode, the component logs warnings when the API is unsupported.

### Polyfill / Fallback Strategy

For browsers without support, consider:

1. **Feature Detection + Graceful Degradation**
   ```tsx
   const isSupported = isHighlightAPISupported();

   return isSupported ? (
     <Highlight search="term" targetRef={ref} />
   ) : (
     <TraditionalMarkHighlight search="term">
       {content}
     </TraditionalMarkHighlight>
   );
   ```

2. **User Notification**
   ```tsx
   {!isHighlightAPISupported() && (
     <div className="warning">
       Your browser doesn't support text highlighting.
       Please upgrade to Chrome 105+, Safari 17.2+, or Firefox 140+.
     </div>
   )}
   ```

### Browser Testing Checklist

When testing your implementation:

- [ ] **Chrome/Edge 105+** - Test full functionality
- [ ] **Safari 17.2+** - Verify no `user-select: none` conflicts
- [ ] **Firefox 140+** - Avoid `text-decoration` and `text-shadow`
- [ ] **Mobile Safari** - Test touch interactions with highlights
- [ ] **Chrome Android** - Verify performance on mobile devices

## 💡 Advanced Examples

### Using the Hook with Custom UI

```tsx
// Note: Import CSS once in your app entry point (main.tsx, App.tsx, or _app.tsx):
// import "react-css-highlight/dist/Highlight.css";

import { useState, useRef } from "react";
import { useHighlight } from "react-css-highlight";

function SearchWithStats() {
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const { matchCount, isSupported, error, refresh } = useHighlight({
    search: searchTerm,
    targetRef: contentRef,
    debounce: 300,
  });

  if (!isSupported) {
    return (
      <div className="alert">
        Your browser doesn't support text highlighting.
        Please upgrade to a modern browser.
      </div>
    );
  }

  return (
    <div>
      <div className="search-header">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="search-input"
        />

        <div className="search-stats">
          {error ? (
            <span className="error">Error: {error.message}</span>
          ) : (
            <span className="match-count">
              {searchTerm && `${matchCount} ${matchCount === 1 ? 'match' : 'matches'}`}
            </span>
          )}
        </div>
      </div>

      <div ref={contentRef} className="content">
        {/* Your content here */}
      </div>
    </div>
  );
}
```

### Dynamic Content / Virtualized Lists

For virtualized lists or dynamically changing content, use the `refresh()` callback:

```tsx
import { useEffect, useRef, useState } from "react";
import { useHighlight } from "react-css-highlight";
import VirtualList from "react-virtual-list"; // or any virtualization library

function VirtualizedSearchList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleRows, setVisibleRows] = useState([]);
  const listRef = useRef<HTMLDivElement>(null);

  const { matchCount, refresh } = useHighlight({
    search: searchTerm,
    targetRef: listRef,
    debounce: 300,
  });

  // Re-highlight when visible rows change (virtualization updates DOM)
  useEffect(() => {
    refresh();
  }, [visibleRows, refresh]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search in list..."
      />
      <p>Found {matchCount} matches</p>

      <div ref={listRef}>
        <VirtualList
          items={items}
          onVisibleRowsChange={setVisibleRows}
        >
          {(item) => <div>{item.content}</div>}
        </VirtualList>
      </div>
    </div>
  );
}
```

### Interactive Search with Debouncing

```tsx
function InteractiveSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />

      <label>
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(e) => setCaseSensitive(e.target.checked)}
        />
        Case sensitive
      </label>

      <p>Found {matchCount} matches</p>

      {/* Debounce prevents excessive updates while typing */}
      <Highlight
        search={searchTerm}
        targetRef={contentRef}
        caseSensitive={caseSensitive}
        debounce={300} // Wait 300ms after user stops typing
        onHighlightChange={setMatchCount}
      />

      <div ref={contentRef}>
        {/* Your content here */}
      </div>
    </div>
  );
}
```

### Custom Debounce Configuration

```tsx
function CustomDebounceExample() {
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* No debounce - immediate updates */}
      <Highlight
        search={searchTerm}
        targetRef={contentRef}
        debounce={0}
      />

      {/* Long debounce for expensive operations */}
      <Highlight
        search={searchTerm}
        targetRef={largeContentRef}
        debounce={500}
        maxHighlights={500}
      />

      {/* Alternative: Use the exported useDebounce hook */}
      <SearchWithCustomDebounce />
    </>
  );
}

// You can also use the exported useDebounce hook directly
import { useDebounce } from "@/components/general/Highlight";

function SearchWithCustomDebounce() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Highlight
        search={debouncedSearch}
        targetRef={contentRef}
        debounce={0} // Already debounced manually
      />

      <div ref={contentRef}>{content}</div>
    </>
  );
}
```

### Multi-Colored Highlights

```tsx
function ColorCodedSearch() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Highlight
        search={["TODO", "FIXME"]}
        targetRef={contentRef}
        highlightName="highlight-warning"
      />
      <Highlight
        search={["DONE", "FIXED"]}
        targetRef={contentRef}
        highlightName="highlight-success"
      />
      <Highlight
        search={["BUG", "ERROR"]}
        targetRef={contentRef}
        highlightName="highlight-error"
      />

      <pre ref={contentRef}>
        {codeContent}
      </pre>
    </>
  );
}
```

### Portal Example

```tsx
import { createPortal } from "react-dom";

function ModalWithHighlight() {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Highlight search="important" targetRef={modalRef} />

      {isOpen && createPortal(
        <div ref={modalRef} className="modal">
          <p>This is important information in a portal.</p>
        </div>,
        document.body
      )}
    </>
  );
}
```

### Error Handling

```tsx
function RobustSearch() {
  const [error, setError] = useState<Error | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Highlight
        search={userInput}
        targetRef={contentRef}
        onError={(err) => {
          console.error("Highlight error:", err);
          setError(err);
        }}
      />

      {error && (
        <div className="error">
          Failed to highlight: {error.message}
        </div>
      )}

      <div ref={contentRef}>{content}</div>
    </>
  );
}
```

## 🎯 Best Practices

### ✅ Do's

```tsx
// ✅ Filter empty/short terms before passing
const validTerms = terms.filter(t => t.trim().length > 0);
<Highlight search={validTerms} targetRef={ref} />

// ✅ Use reasonable maxHighlights for large documents
<Highlight search="term" targetRef={ref} maxHighlights={500} />

// ✅ Memoize search terms if they're derived from props
const searchTerms = useMemo(() =>
  extractTerms(props.query),
  [props.query]
);

// ✅ Use wholeWord for precise matching
<Highlight search="cat" targetRef={ref} wholeWord />
// Only matches "cat", not "category" or "scatter"

// ✅ Provide meaningful highlightName for multiple highlights
<Highlight search="error" highlightName="log-error" />
<Highlight search="warning" highlightName="log-warning" />
```

### ❌ Don'ts

```tsx
// ❌ Don't create highlights on every render
{items.map(item =>
  <Highlight search={item.term} targetRef={ref} key={item.id} />
)}
// This creates N highlights! Use array instead:
<Highlight search={items.map(i => i.term)} targetRef={ref} />

// ❌ Don't use extremely high maxHighlights
<Highlight search="a" maxHighlights={999999} /> // Will freeze browser!

// ❌ Don't highlight on input change without debounce
<input onChange={(e) => setSearch(e.target.value)} />
<Highlight search={search} targetRef={ref} debounce={0} /> // Will update on every keystroke!

// ✅ Use the built-in debounce prop (recommended)
<Highlight search={search} targetRef={ref} debounce={300} />

// ✅ Or debounce manually using the exported hook
const debouncedSearch = useDebounce(search, 300);
<Highlight search={debouncedSearch} targetRef={ref} />

// ❌ Don't pass empty strings
<Highlight search={["", "term", ""]} /> // Filter first!

// ❌ Don't use wrapper pattern for complex scenarios
<HighlightWrapper>
  <HighlightWrapper>  // Nested = bad
    <Content />
  </HighlightWrapper>
</HighlightWrapper>
```

## 🐛 Troubleshooting

### No highlights appear

**Check:**
1. Browser supports CSS Custom Highlight API (Chrome 105+, Safari 17.2+)
2. `targetRef.current` is not null (component is mounted)
3. Search terms are not empty strings
4. Content actually contains the search terms
5. Check browser console for errors

```tsx
// Debug helper
<Highlight
  search="term"
  targetRef={ref}
  onHighlightChange={(count) => console.log(`Found ${count} matches`)}
  onError={(err) => console.error(err)}
/>
```

### Performance issues / Slow highlighting

**Solutions:**
- Use the built-in `debounce` prop (default is 100ms)
- Reduce `maxHighlights` (default is 1000)
- Filter out short/common terms
- Break large documents into smaller sections

```tsx
// Use built-in debounce (recommended)
<Highlight
  search={searchTerm}
  targetRef={ref}
  debounce={300} // Wait 300ms after changes
  maxHighlights={300} // Lower limit
/>

// Or debounce manually
const debouncedSearch = useDebounce(searchTerm, 300);
<Highlight
  search={debouncedSearch}
  targetRef={ref}
  debounce={0} // Already debounced
  maxHighlights={300}
/>
```

### Highlights don't update when content changes

**Solution:** For dynamic content (virtualized lists, infinite scroll, etc.), use the `refresh()` callback:

```tsx
// Using the hook with refresh
const { refresh } = useHighlight({
  search: "term",
  targetRef: contentRef
});

// Re-highlight after content changes
useEffect(() => {
  refresh();
}, [contentVersion, refresh]);
```

**Alternative:** Force re-render the Highlight component with a key:

```tsx
// Works but less efficient
<Highlight
  key={contentVersion}
  search="term"
  targetRef={ref}
/>
```

### Highlights appear in unwanted elements

The component automatically skips:
- `<script>`
- `<style>`
- `<noscript>`
- `<iframe>`
- `<textarea>`

For additional exclusions, wrap excluded content in a container and don't pass its ref.

### TypeScript errors with targetRef

```tsx
// ❌ Wrong
const ref = useRef<HTMLDivElement>();

// ✅ Correct
const ref = useRef<HTMLDivElement>(null);
```

## 🎓 How It Works

### Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│                    React Layer                            │
│  useHighlight Hook (React-specific concerns)              │
│  - State management (matchCount, error, isSupported)      │
│  - Effect lifecycle & cleanup                             │
│  - Debouncing user input                                  │
│  - Callback stability (useEffectEvent)                    │
└─────────────────────┬─────────────────────────────────────┘
                      │ Delegates to
┌─────────────────────▼─────────────────────────────────────┐
│                   Vanilla Core                            │
│  createHighlight · createCompareHighlight (both agnostic) │
│  - DOM traversal · regex search / positional compare      │
│  - CSS Custom Highlight API integration                   │
│  - Async scheduling (requestIdleCallback)                 │
│  - Used by React, Vue, Svelte, Angular, etc.              │
└───────────────────────────────────────────────────────────┘
```

### Execution Flow

```
┌─────────────────────────────────────────────────────┐
│  1. User provides search terms + targetRef          │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  2. Normalize and validate input                    │
│     - Trim whitespace, filter empty strings         │
│     - Pre-compile regex patterns (once)             │
│     - Escape special characters                     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  3. TreeWalker traverses DOM text nodes [SYNC]      │
│     - Skip SCRIPT, STYLE, empty nodes               │
│     - Process only TEXT_NODE types                  │
│     - Calculate match count immediately             │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  4. Create Range objects for matches [SYNC]         │
│     - Calculate start/end offsets                   │
│     - Store ranges in array                         │
│     - Update matchCount & call onChange             │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  5. Schedule visual update [ASYNC]                  │
│     - requestIdleCallback queues update             │
│     - Waits for browser idle time                   │
│     - Non-blocking, cancellable                     │
└──────────────────┬──────────────────────────────────┘
                   │ (when browser is idle)
┌──────────────────▼──────────────────────────────────┐
│  6. Register with CSS.highlights API [ASYNC]        │
│     - Create Highlight(...ranges)                   │
│     - CSS.highlights.set(name, highlight)           │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  7. Browser applies ::highlight() CSS styles        │
│     - Non-invasive (no DOM mutation)                │
│     - Hardware accelerated                          │
└─────────────────────────────────────────────────────┘
```


## 🔗 Related Resources

- [CSS Custom Highlight API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)
- [TreeWalker API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)
- [Range API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Range)
- [Browser Compatibility](https://caniuse.com/mdn-api_highlight)

