# Vanilla JavaScript API

Framework-agnostic text highlighting using CSS Custom Highlight API.

## Quick Start

```bash
npm install react-css-highlight
```

```javascript
import { createHighlight } from 'react-css-highlight/vanilla';
import 'react-css-highlight/styles';

const controller = createHighlight(document.getElementById('content'), {
  search: 'JavaScript',
  onHighlightChange: (count) => console.log(`${count} matches`)
});
```

> **Note:** This package requires a bundler (Vite, Webpack, Esbuild, etc.) or module system (Node.js, ES modules). It does not work with plain `<script>` tags. If you need a no-build solution, see the [Full Documentation](../../README.md) for alternatives.

## API

### `createHighlight(element, options)`

Creates a highlight controller for managing text highlights.

**Returns:** `HighlightController`

```javascript
interface HighlightController {
  readonly matchCount: number;
  update(options: Partial<HighlightOptions>): void;
  destroy(): void;
}
```

### Options

```typescript
interface HighlightOptions {
  search: string | string[];           // Required
  highlightName?: string;              // Default: "highlight"
  caseSensitive?: boolean;             // Default: false
  wholeWord?: boolean;                 // Default: false
  maxHighlights?: number;              // Default: 1000
  ignoredTags?: string[];              // Default: []
  onHighlightChange?: (count: number) => void;
  onError?: (error: Error) => void;
}
```

## Examples

### Vue 3

```vue
<script setup>
import { ref, onMounted, watch } from 'vue';
import { createHighlight } from 'react-css-highlight/vanilla';

const searchTerm = ref('');
const contentRef = ref(null);
let controller = null;

onMounted(() => {
  controller = createHighlight(contentRef.value, {
    search: searchTerm.value
  });
});

watch(searchTerm, (term) => controller?.update({ search: term }));
</script>

<template>
  <input v-model="searchTerm">
  <div ref="contentRef">Content here</div>
</template>
```

### Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import { createHighlight } from 'react-css-highlight/vanilla';

  let searchTerm = '';
  let element;
  let controller;

  onMount(() => {
    controller = createHighlight(element, { search: searchTerm });
  });

  $: controller?.update({ search: searchTerm });
</script>

<input bind:value={searchTerm}>
<div bind:this={element}>Content here</div>
```

### Vanilla JS

```javascript
const input = document.getElementById('search');
const content = document.getElementById('content');

const controller = createHighlight(content, {
  search: '',
  onHighlightChange: (count) => {
    document.getElementById('count').textContent = count;
  }
});

input.addEventListener('input', (e) => {
  controller.update({ search: e.target.value });
});
```

## Utility Functions

```javascript
import {
  isHighlightAPISupported,  // Check browser support
  findTextMatches,          // Find matches in DOM
  registerHighlight,        // Register with CSS.highlights
  removeHighlight,          // Remove from CSS.highlights
  normalizeSearchTerms,     // Normalize search input
  DEFAULT_MAX_HIGHLIGHTS,
  IGNORED_TAG_NAMES
} from 'react-css-highlight/vanilla';
```

## Browser Support

- Chrome 105+
- Edge 105+
- Safari 17.2+
- Firefox 140+

Check support at runtime:

```javascript
import { isHighlightAPISupported } from 'react-css-highlight/vanilla';

if (!isHighlightAPISupported()) {
  console.warn('CSS Custom Highlight API not supported');
}
```

## Full Documentation

See the [main README](../../README.md) for complete documentation, styling guide, and advanced examples.

