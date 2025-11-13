import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Highlight from "./Highlight";
import HighlightWrapper from "./HighlightWrapper";
import "./Highlight.css";

const meta: Meta<typeof Highlight> = {
  title: "components/General/Highlight",
  component: Highlight,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Highlights search terms in text using the CSS Custom Highlight API. " +
          "This component uses TreeWalker for efficient DOM traversal and supports " +
          "multiple search terms, case sensitivity, and whole word matching.\n\n" +
          "**Two Usage Patterns:**\n" +
          "- `Highlight` (default) - Ref-based API for power users and complex scenarios\n" +
          "- `HighlightWrapper` - Convenience wrapper for simple use cases",
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
          <h2>About the Highlight Component</h2>
          <p>
            Highlight is a powerful, zero-dependency React component for highlighting
            text using the modern CSS Custom Highlight API. It uses TreeWalker for
            blazing-fast DOM traversal, making it 500× faster than naive approaches.
            The component is non-invasive and has zero impact on your DOM structure
            or React component tree.
          </p>
          <p>
            The Highlight component supports multiple search terms, case sensitivity,
            whole word matching, and fully customizable CSS styling. It offers two
            usage patterns: a ref-based API for power users and complex scenarios, and
            a wrapper component for simple use cases. The component works seamlessly
            with React portals and complex layouts.
          </p>
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
          <h2>Log Messages</h2>
          <p>
            [2024-01-15 10:23:45] success: Application started successfully on port
            3000
          </p>
          <p>
            [2024-01-15 10:24:12] warning: Deprecated API usage detected in module
            UserService
          </p>
          <p>
            [2024-01-15 10:24:30] error: Failed to connect to database - Connection
            timeout
          </p>
          <p>
            [2024-01-15 10:24:45] success: Retry successful, database connection
            established
          </p>
          <p>
            [2024-01-15 10:25:00] warning: High memory usage detected (85% of
            available RAM)
          </p>
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
          <h2>Data Processing</h2>
          <p>
            Data analysis involves collecting, processing, and analyzing DATA to
            extract meaningful insights. Raw data must be cleaned and transformed
            before analysis. The data pipeline ensures data quality and consistency.
          </p>
          <p>
            Big Data technologies handle massive datasets that traditional data
            processing software cannot manage. Data scientists use statistical
            methods to analyze data patterns and trends.
          </p>
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
          <p>
            The cat sat on the mat. The catalog contains many categories of
            concatenated strings. Scattered throughout, you'll find cats and their
            catastrophic adventures.
          </p>
          <p>
            Without whole word matching: highlights "cat" in catalog, categories,
            concatenated, scattered, cats, catastrophic
          </p>
          <p>With whole word matching: only highlights the standalone word "cat"</p>
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
          <h2>Custom Styling</h2>
          <p>
            This is an important message with important information. It's important
            to note that custom CSS can be applied to highlights using the
            highlightName prop.
          </p>
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
          <h2>System Status</h2>
          <p>success: All systems operational</p>
          <p>warning: High CPU usage detected</p>
          <p>error: Database connection failed</p>
          <p>success: Automatic recovery completed</p>
          <p>warning: Cache memory nearly full</p>
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
 * Convenience wrapper pattern for simple use cases
 * Uses HighlightWrapper which manages the ref internally and injects it into the child.
 * No extra DOM wrapper elements are created!
 */
export const WrapperPattern: Story = {
  render: () => {
    return (
      <div style={{ maxWidth: 600 }}>
        <h3 style={{ marginBottom: 16 }}>Using HighlightWrapper (Simpler API)</h3>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          HighlightWrapper injects a ref into your child element - no wrapper divs
          needed!
        </p>
        <HighlightWrapper search="important">
          <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 4 }}>
            <h4>Simple Wrapper Usage</h4>
            <p>
              This is an important message about important topics. The wrapper
              pattern is important for simple use cases where you don't need multiple
              highlights or advanced features.
            </p>
            <p>
              Notice how you don't need to manage refs manually - the wrapper handles
              it for you! This is important for developer experience.
            </p>
          </div>
        </HighlightWrapper>
      </div>
    );
  },
};

/**
 * Comparison showing when to use each pattern
 */
export const WhenToUseWhich: Story = {
  render: () => {
    const sharedContentRef = useRef<HTMLDivElement>(null);

    return (
      <div style={{ maxWidth: 800 }}>
        <h2>When to Use Which Pattern?</h2>

        <section style={{ marginTop: 24 }}>
          <h3>✅ Use HighlightWrapper when:</h3>
          <ul>
            <li>Simple, single highlight needed</li>
            <li>Content is self-contained</li>
            <li>You want cleaner, simpler code</li>
          </ul>

          <div style={{ marginTop: 16 }}>
            <HighlightWrapper search="simple">
              <div
                style={{ padding: 12, backgroundColor: "#f5f5f5", borderRadius: 4 }}
              >
                <p>
                  This is a simple example with simple highlighting. Perfect for
                  simple use cases!
                </p>
              </div>
            </HighlightWrapper>
          </div>
        </section>

        <section style={{ marginTop: 32 }}>
          <h3>✅ Use Highlight (ref-based) when:</h3>
          <ul>
            <li>Multiple highlights on same content</li>
            <li>Content in portals or complex layouts</li>
            <li>Need to highlight existing components</li>
            <li>Want zero performance overhead</li>
          </ul>

          <div style={{ marginTop: 16 }}>
            <Highlight
              search="multiple"
              targetRef={sharedContentRef}
              highlightName="highlight-primary"
            />
            <Highlight
              search="highlights"
              targetRef={sharedContentRef}
              highlightName="highlight-secondary"
            />

            <div
              ref={sharedContentRef}
              style={{ padding: 12, backgroundColor: "#f5f5f5", borderRadius: 4 }}
            >
              <p>
                You can have multiple highlights on the same content! This shows both
                "multiple" and "highlights" with different styles.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  },
};
