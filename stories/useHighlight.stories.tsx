import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useHighlight } from "../src/Highlight.hooks";
import { ReactEcosystemContent, SystemLogContent } from "./content";
import "../src/Highlight.css";

// Wrapper component for Storybook to render the hook
function UseHighlightDemo(props: Parameters<typeof useHighlight>[0]) {
  const { matchCount, isSupported, error } = useHighlight(props);

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Hook State:</h3>
        <div>
          <strong>matchCount:</strong> {matchCount}
        </div>
        <div>
          <strong>isSupported:</strong> {isSupported ? "✅ Yes" : "❌ No"}
        </div>
        <div>
          <strong>error:</strong> {error ? `❌ ${error.message}` : "✅ None"}
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof useHighlight> = {
  title: "useHighlight Hook",
  component: UseHighlightDemo as any,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The `useHighlight` hook provides the same functionality as the `Highlight` component, " +
          "but gives you direct access to the highlight state (matchCount, isSupported, error). " +
          "This is useful when you need to build custom UI that displays match counts, error messages, " +
          "or conditionally renders based on browser support.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof useHighlight>;

/**
 * Interactive search with real-time match count display
 */
export const InteractiveSearch: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState("react");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const { matchCount, isSupported, error, refresh } = useHighlight({
      search: searchTerm,
      targetRef: contentRef,
      caseSensitive,
      wholeWord,
      debounce: 300,
    });

    return (
      <div style={{ maxWidth: 600 }}>
        <div
          style={{
            marginBottom: "20px",
            padding: "20px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
            style={{
              padding: "12px",
              fontSize: "16px",
              width: "100%",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          />

          <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
              />
              Case sensitive
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
              />
              Whole word
            </label>
            <button onClick={refresh} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: "4px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}>Refresh</button>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: matchCount > 0 ? "#dcfce7" : "#f3f4f6",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {error ? (
              <span style={{ color: "#dc2626" }}>Error: {error.message}</span>
            ) : !isSupported ? (
              <span style={{ color: "#dc2626" }}>
                Browser not supported
              </span>
            ) : searchTerm ? (
              <span style={{ color: matchCount > 0 ? "#059669" : "#6b7280" }}>
                {matchCount} {matchCount === 1 ? "result" : "results"}
              </span>
            ) : (
              <span style={{ color: "#6b7280" }}>Start typing to search...</span>
            )}
          </div>
        </div>

        <div ref={contentRef} style={{ lineHeight: 1.6 }} contentEditable>
          {ReactEcosystemContent}
        </div>
      </div>
    );
  },
};

// Define search terms outside component to avoid recreation on every render
const ERROR_TERMS = ["error", "bug", "fail"];
const WARNING_TERMS = ["warning", "caution"];
const SUCCESS_TERMS = ["success", "fixed", "resolved"];

/**
 * Multi-term highlighting with different styles
 */
export const MultiTermHighlight: Story = {
  render: () => {
    const contentRef = useRef<HTMLDivElement>(null);

    const errorResult = useHighlight({
      search: ERROR_TERMS,
      targetRef: contentRef,
      highlightName: "highlight-error",
    });

    const warningResult = useHighlight({
      search: WARNING_TERMS,
      targetRef: contentRef,
      highlightName: "highlight-warning",
    });

    const successResult = useHighlight({
      search: SUCCESS_TERMS,
      targetRef: contentRef,
      highlightName: "highlight-success",
    });

    return (
      <div style={{ maxWidth: 600 }}>
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Match Statistics:</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#ffccbc",
                  borderRadius: "4px",
                }}
              />
              <span>
                Errors: <strong>{errorResult.matchCount}</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#fde68a",
                  borderRadius: "4px",
                }}
              />
              <span>
                Warnings: <strong>{warningResult.matchCount}</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#dcfce7",
                  borderRadius: "4px",
                }}
              />
              <span>
                Success: <strong>{successResult.matchCount}</strong>
              </span>
            </div>
          </div>
        </div>

        <div
          ref={contentRef}
          style={{
            lineHeight: 1.6,
            padding: "15px",
            backgroundColor: "#FFF",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        >
          {SystemLogContent}
        </div>
      </div>
    );
  },
};


