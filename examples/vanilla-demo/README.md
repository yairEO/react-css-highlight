# Vanilla Highlight Demo

Pure vanilla JS demo - no React, no framework. Uses Vite for TypeScript compilation and dev server.

## Setup

```bash
cd examples/vanilla-demo
pnpm install
pnpm dev
```

Opens at `http://localhost:3000`

## What's Included

- **Pure vanilla JavaScript** - No frameworks, just DOM APIs
- **Vite** - Dev server with TypeScript support and hot reload
- **Direct source imports** - Imports from `../../src` via alias so changes are instant

The demo is 100% vanilla JS - Vite is only used for TypeScript compilation and dev server. The runtime code is pure browser JavaScript.

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

