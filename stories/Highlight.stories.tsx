import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Highlight from "../src";
import "../src/Highlight.css";
import {
  AboutHighlightComponentContent,
  CustomStylingContent,
  DataProcessingContent,
  SystemLogContent,
  SystemStatusContent,
  WholeWordExampleContent,
} from "./content";

const meta: Meta<typeof Highlight> = {
    title: "Highlight",
    component: Highlight,
    parameters: {
        layout: "centered",
        docs: {
            codePanel: true,
            description: {
                component:
                    "Highlights search terms in text using the CSS Custom Highlight API. " +
                    "This component uses TreeWalker for efficient DOM traversal and supports " +
                    "multiple search terms, case sensitivity, and whole word matching.",
            },
        },
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Highlight>;

/**
 * Basic single term highlight
 */
export const SingleTerm: Story = {
  render: () => {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
      <div style={{ maxWidth: 600 }}>
        <Highlight search="Highlight" targetRef={contentRef} />
        <div ref={contentRef}>
          {AboutHighlightComponentContent}
        </div>
      </div>
    );
  },
};

/**
 * Multiple search terms highlighted at once
 */
export const MultipleTerms: Story = {
  render: () => {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
      <div style={{ maxWidth: 600 }}>
        <Highlight search={["error", "warning", "success"]} targetRef={contentRef} />
        <div ref={contentRef}>
          {SystemLogContent}
        </div>
      </div>
    );
  },
};

/**
 * Interactive search with case sensitivity toggle
 */
export const InteractiveSearch: Story = {
  render: () => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState("data");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [matchCount, setMatchCount] = useState(0);
    const [debounceMs, setDebounceMs] = useState(100);

    return (
      <div style={{ maxWidth: 600 }}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              style={{
                padding: "8px 12px",
                fontSize: 14,
                border: "1px solid #ccc",
                borderRadius: 4,
                width: "100%",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
              />
              Case sensitive
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
            >
              Debounce (ms):
              <input
                type="number"
                value={debounceMs}
                onChange={(e) => setDebounceMs(Number(e.target.value))}
                min="0"
                max="1000"
                step="50"
                style={{ width: 80, padding: 4, fontSize: 14 }}
              />
            </label>
            <span style={{ marginLeft: "auto", fontSize: 14, color: "#666" }}>
              {matchCount} matches
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
            💡 Highlights update <strong>{debounceMs}ms</strong> after you stop
            typing. Try typing quickly to see the debounce in action!
          </p>
        </div>

        <Highlight
          search={searchTerm}
          targetRef={contentRef}
          caseSensitive={caseSensitive}
          debounce={debounceMs}
          onHighlightChange={setMatchCount}
        />

        <div ref={contentRef}>
          {DataProcessingContent}
        </div>
      </div>
    );
  },
};

/**
 * Whole word matching
 */
export const WholeWordMatch: Story = {
  render: () => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [wholeWord, setWholeWord] = useState(false);

    return (
      <div style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={(e) => setWholeWord(e.target.checked)}
            />
            Match whole words only (search for "cat")
          </label>
        </div>

        <Highlight search="cat" targetRef={contentRef} wholeWord={wholeWord} />

        <div ref={contentRef}>
          {WholeWordExampleContent}
        </div>
      </div>
    );
  },
};

/**
 * Custom highlight style using highlightName prop
 */
export const CustomStyle: Story = {
  render: () => {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
      <div style={{ maxWidth: 600 }}>
        <style>
          {`
            ::highlight(custom-pink) {
              background-color: #ff69b480;
              color: #000;
              text-decoration: underline wavy;
            }
          `}
        </style>

        <Highlight
          search="important"
          targetRef={contentRef}
          highlightName="custom-pink"
        />

        <div ref={contentRef}>
          {CustomStylingContent}
        </div>
      </div>
    );
  },
};

/**
 * Multiple Highlight components with different styles
 */
export const MultipleHighlights: Story = {
  render: () => {
    const contentRef = useRef<HTMLDivElement>(null);

    // CSS.highlights API is used internally by the Highlight component

    return (
      <div style={{ maxWidth: 600 }}>
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
        <Highlight
          search="success"
          targetRef={contentRef}
          highlightName="highlight-success"
        />

        <div ref={contentRef}>
          {SystemStatusContent}
        </div>
      </div>
    );
  },
};

/**
 * Large content performance test
 */
export const LargeContent: Story = {
  render: () => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [matchCount, setMatchCount] = useState(0);

    const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. `;

    return (
      <div style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 16, fontSize: 14, color: "#666" }}>
          Searching in {loremIpsum.repeat(20).length} characters - Found {matchCount}{" "}
          matches
        </div>

        <Highlight
          search={["dolor", "amet", "elit"]}
          targetRef={contentRef}
          onHighlightChange={setMatchCount}
          maxHighlights={500}
        />

        <div
          ref={contentRef}
          style={{
            maxHeight: 400,
            overflow: "auto",
            padding: 16,
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          {loremIpsum.repeat(20)}
        </div>
      </div>
    );
  },
};

