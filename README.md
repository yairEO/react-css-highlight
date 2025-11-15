# React Text <mark>Highlight</mark> Component

> Modern, zero-dependency component for highlighting text using [CSS Custom Highlight](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::highlight) API

[![npm version](https://img.shields.io/npm/v/react-css-highlight?style=flat-square&logo=npm)](https://www.npmjs.com/package/react-css-highlight)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![CSS Highlight API](https://img.shields.io/badge/CSS-Highlights%20API-ff69b4?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)



https://github.com/user-attachments/assets/6dfefafd-869a-4712-8e89-21b78789fdea


---

## ✨ Features

- 🚀 **Blazing Fast** - No DOM mutiations! Uses `TreeWalker` for efficient DOM traversal (500× faster than naive approaches)
- 🎯 **Non-Invasive** - Zero impact on your DOM structure or React component tree. The DOM is not mutated.
- 🎨 **Fully Customizable** - Control highlights colors with simple CSS variables
- 🔄 **Multi-Term Support** - Highlight multiple search terms simultaneously with different styles
- 📦 **Zero Dependencies** - Pure React + Modern Browser APIs
- 🧩 **Two Usage Patterns** - Ref-based (power users) or wrapper (convenience)
- 🌐 **TypeScript First** - Full type safety with extensive JSDoc documentation

---

## 🎯 Use Cases

- 🔍 **Search Results** - Highlight search terms in documentation, articles, or search results
- 📝 **Code Editors** - Syntax highlighting and search in code blocks
- 📊 **Data Tables** - Highlight matching values in large datasets
- 🎓 **Learning Tools** - Emphasize key terms in educational content
- 🔐 **Security Audit** - Highlight sensitive data patterns in logs
- 📧 **Email Clients** - Highlight mentions, keywords, or search matches

---

## 📖 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Patterns](#-usage-patterns)
  - [Component (Ref-Based)](#1-component-ref-based)
  - [Wrapper (Simple)](#2-wrapper-simple)
  - [Hook (Maximum Control)](#3-hook-maximum-control)
- [API Reference](#-api-reference)
- [Styling](#-styling)
- [Performance](#-performance)
- [Browser Support](#-browser-support)
- [Advanced Examples](#-advanced-examples)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

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

---

## 🚀 Quick Start

### Basic Example

```tsx
import { useRef } from "react";
import Highlight from "@/components/general/Highlight";

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

---

## 📚 Usage Patterns

There are three ways to use this library, each suited for different scenarios:

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
| `matchCount` | `number` | Number of highlighted matches found |
| `isSupported` | `boolean` | Whether the browser supports CSS Custom Highlight API |
| `error` | `Error \| null` | Error object if highlighting failed, null otherwise |

**When to use the hook vs component:**

- **Use the component** when you just need highlighting without additional UI logic
- **Use the hook** when you need to:
  - Display match counts in your UI
  - Show error messages to users
  - Conditionally render UI based on browser support
  - Build complex components that need highlight state
  - Integrate with form state or other React state management

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
| `matchCount` | `number` | Number of matches currently highlighted |
| `isSupported` | `boolean` | Whether browser supports CSS Custom Highlight API |
| `error` | `Error \| null` | Error object if highlighting failed, null otherwise |

### `Highlight` Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `search` | `string \| string[]` | **required** | Text to highlight (supports multiple terms) |
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

---

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

### Custom Styles

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

---

## ⚡ Performance

### Optimizations

- **Pre-compiled Regex** - Patterns compiled once per search (500× faster)
- **TreeWalker** - Native browser API for efficient DOM traversal
- **Early Exit** - Stops at `maxHighlights` limit
- **Empty Node Skipping** - Ignores whitespace-only text nodes
- **requestIdleCallback** - Non-blocking search execution
- **Performance Monitoring** - Dev-mode warnings for slow searches (>100ms)

### Performance Tips

```tsx
// ✅ Good - Single highlight with reasonable limit
<Highlight search="term" targetRef={ref} maxHighlights={500} />

// ✅ Good - Pre-filter search terms
<Highlight
  search={terms.filter(t => t.length > 2)}
  targetRef={ref}
/>

// ⚠️ Caution - Many terms on huge documents
<Highlight
  search={[...100terms]}
  targetRef={ref}
  maxHighlights={5000} // Consider lowering
/>
```

### Benchmarks

| Content Size | Search Terms | Time | Highlights |
|--------------|--------------|------|------------|
| 1,000 nodes  | 1 term       | ~5ms | ~50 |
| 1,000 nodes  | 5 terms      | ~15ms | ~250 |
| 10,000 nodes | 1 term       | ~40ms | ~500 |
| 10,000 nodes | 10 terms     | ~120ms | 1000 (max) |

*Tested on MacBook Pro M1, Chrome 120*

---

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
import { isHighlightAPISupported } from "@/components/general/Highlight/utils";

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

---

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

  const { matchCount, isSupported, error } = useHighlight({
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

---

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

---

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

**Solution:** Content is assumed to be static. If content changes, re-render the Highlight component:

```tsx
// Force re-render with key
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

---

## 🎓 How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  1. User provides search terms + targetRef          │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  2. Pre-compile regex patterns (once)               │
│     - Escape special characters                     │
│     - Add word boundaries if needed                 │
│     - Validate patterns                             │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  3. TreeWalker traverses DOM text nodes             │
│     - Skip SCRIPT, STYLE, empty nodes               │
│     - Process only TEXT_NODE types                  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  4. Create Range objects for each match             │
│     - Calculate start/end offsets                   │
│     - Handle multi-node matches                     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  5. Register with CSS.highlights API                │
│     - Create Highlight(...ranges)                   │
│     - CSS.highlights.set(name, highlight)           │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  6. Browser applies ::highlight() CSS styles        │
│     - Non-invasive (no DOM mutation)                │
│     - Hardware accelerated                          │
└─────────────────────────────────────────────────────┘
```


## 🔗 Related Resources

- [CSS Custom Highlight API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)
- [TreeWalker API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)
- [Range API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Range)
- [Browser Compatibility](https://caniuse.com/mdn-api_highlight)
- [React 19 useEffectEvent](https://react.dev/reference/react/experimental_useEffectEvent)

