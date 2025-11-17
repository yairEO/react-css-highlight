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

/**
 * Multiple independent Highlight instances working together
 * Demonstrates automatic range merging - all instances use default highlightName="highlight"
 */
export const MultipleInstances: Story = {
  render: () => {
    const contentRef1 = useRef<HTMLDivElement>(null);
    const contentRef2 = useRef<HTMLDivElement>(null);
    const contentRef3 = useRef<HTMLDivElement>(null);
    const [matchCount1, setMatchCount1] = useState(0);
    const [matchCount2, setMatchCount2] = useState(0);
    const [matchCount3, setMatchCount3] = useState(0);

    return (
      <div style={{ maxWidth: 800 }}>
        <div style={{
          marginBottom: 20,
          padding: 16,
          background: "#e0f2fe",
          borderRadius: 8,
          borderLeft: "4px solid #0284c7"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: 8, color: "#0369a1" }}>
            ✨ Multiple Instances Feature
          </h3>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            All three sections below use the default <code style={{
              background: "#fff",
              padding: "2px 6px",
              borderRadius: 3,
              fontSize: 13
            }}>highlightName="highlight"</code>. Previously, only the last instance would work
            (overwriting the others). Now they all work together seamlessly via automatic range merging!
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600 }}>
            Total highlights across all sections: {matchCount1 + matchCount2 + matchCount3}
          </p>
        </div>

        {/* First instance - highlighting "React" */}
        <Highlight
          search="React"
          targetRef={contentRef1}
          onHighlightChange={setMatchCount1}
        />
        <div
          ref={contentRef1}
          style={{
            padding: 16,
            border: "2px solid #e5e7eb",
            borderRadius: 6,
            marginBottom: 16,
            background: "#fff"
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: 8, color: "#374151" }}>
            Section 1: React Overview <span style={{
              fontSize: 12,
              fontWeight: "normal",
              color: "#6b7280",
              background: "#fef3c7",
              padding: "2px 8px",
              borderRadius: 3
            }}>
              {matchCount1} matches
            </span>
          </h4>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            React is a JavaScript library for building user interfaces.
            React makes it painless to create interactive UIs.
            Design simple views for each state in your React application,
            and React will efficiently update and render just the right components
            when your data changes.
          </p>
        </div>

        {/* Second instance - highlighting "JavaScript" */}
        <Highlight
          search="JavaScript"
          targetRef={contentRef2}
          onHighlightChange={setMatchCount2}
        />
        <div
          ref={contentRef2}
          style={{
            padding: 16,
            border: "2px solid #e5e7eb",
            borderRadius: 6,
            marginBottom: 16,
            background: "#fff"
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: 8, color: "#374151" }}>
            Section 2: JavaScript Language <span style={{
              fontSize: 12,
              fontWeight: "normal",
              color: "#6b7280",
              background: "#fef3c7",
              padding: "2px 8px",
              borderRadius: 3
            }}>
              {matchCount2} matches
            </span>
          </h4>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            JavaScript is a versatile programming language that powers the modern web.
            JavaScript can update and change both HTML and CSS.
            JavaScript is the world's most popular programming language.
            JavaScript is the programming language of the Web.
          </p>
        </div>

        {/* Third instance - highlighting "API" */}
        <Highlight
          search="API"
          targetRef={contentRef3}
          onHighlightChange={setMatchCount3}
        />
        <div
          ref={contentRef3}
          style={{
            padding: 16,
            border: "2px solid #e5e7eb",
            borderRadius: 6,
            background: "#fff"
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: 8, color: "#374151" }}>
            Section 3: CSS Custom Highlight API <span style={{
              fontSize: 12,
              fontWeight: "normal",
              color: "#6b7280",
              background: "#fef3c7",
              padding: "2px 8px",
              borderRadius: 3
            }}>
              {matchCount3} matches
            </span>
          </h4>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            The CSS Custom Highlight API provides a mechanism for styling arbitrary text ranges.
            This API allows you to programmatically create highlights without modifying the DOM.
            The Highlight API is a modern browser feature for efficient text highlighting.
          </p>
        </div>
      </div>
    );
  },
};

