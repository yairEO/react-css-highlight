# Vanilla Highlight Demo

Live playground for the **framework-agnostic** APIs from `react-css-highlight/vanilla`: no React, only the browser and bundled library code. Vite is used only for the dev server and resolving imports.

## What this demo showcases

**1. Search highlighting (`createHighlight`)**  
The top block drives `createHighlight` against a static article: comma-separated search terms, optional **case sensitive** and **whole word** matching, and buttons to update, clear, or destroy the highlight controller. Stats show match count and how many terms are active. Highlights use the default `highlight` name and **`::highlight()`** styling from the package stylesheet—no DOM wrapping (`<mark>`, extra spans).

**2. Positional string comparison (`createCompareHighlight`)**  
The lower section compares two **`contenteditable`** panels (base vs modified). Flattened text is diffed index-by-index; mismatches paint as **pink** on the reference side and **green** on the other (`highlight-diff-base` / `highlight-diff-compare`). Stats report how many character positions differ and the length of each side. Typing triggers a debounced **`refresh()`**; **Reset** restores the bundled sample paragraphs. Same CSS Highlight API pipeline as search, including sync diff count vs idle-time registration.

**3. Browser support**  
If `CSS.highlights` is missing, a warning banner explains the limitation; unsupported browsers skip meaningful highlighting behavior.

Together, the page shows both **substring search** and **two-pane diff-style** workflows you can lift into Vue, Svelte, or plain apps.

## Setup

```bash
cd examples/vanilla-demo
pnpm install
pnpm dev
```

Opens at `http://localhost:3000`

## What's included (tooling)

- **Pure vanilla JavaScript** — No frameworks, just DOM APIs
- **Vite** — Dev server with hot reload
- **Direct source imports** — Imports from `../../src` via alias so library changes reflect immediately during development

The demo is 100% vanilla JS at runtime; Vite only compiles and serves.

## Alternative: npm link

If you prefer using `npm link` in a separate project:

```bash
# In react-css-highlight root
pnpm link --global

# In your test project
pnpm link react-css-highlight --global
```

Then import normally:

```js
import { createHighlight } from 'react-css-highlight/vanilla';
```

For full API notes (including compare options and behavior), see the root [README.md](../../README.md) (Vanilla usage and **String comparison** sections) and [src/vanilla/README.md](../../src/vanilla/README.md).
