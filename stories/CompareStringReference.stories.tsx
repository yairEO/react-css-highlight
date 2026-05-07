import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createCompareHighlight } from "../src/index";
import "../src/Highlight.css";

/** Fixed reference compared to editable content (`createCompareHighlight(string, HTMLElement)`). */
function CompareStringReferenceDemo() {
  const liveRef = useRef<HTMLDivElement>(null);
  const diffCountRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const live = liveRef.current;
    if (!live) {
      return;
    }

    const referenceString = "Hello, world.";
    const ctrl = createCompareHighlight(referenceString, live, {
      onDiffChange(count) {
        const el = diffCountRef.current;
        if (el) {
          el.textContent = String(count);
        }
      },
      onError(err) {
        console.warn("Compare story:", err.message);
      },
    });

    const onInput = () => {
      ctrl.refresh();
    };
    live.addEventListener("input", onInput);

    return () => {
      live.removeEventListener("input", onInput);
      ctrl.destroy();
    };
  }, []);

  return (
    <div style={{ maxWidth: 480, fontFamily: "system-ui, sans-serif" }}>
      <p style={{ margin: "0 0 8px" }}>
        Reference string: <code>Hello, world.</code>
      </p>
      <p style={{ margin: "0 0 8px" }}>
        Differing positions:{" "}
        <span ref={diffCountRef} style={{ fontWeight: 700 }}>
          0
        </span>
      </p>
      <div
        ref={liveRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          minHeight: 72,
          padding: 12,
          outlineOffset: 2,
        }}
      >
        Hello, kitty.
      </div>
      <p style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
        Edit the box; mismatches versus the fixed string highlight in place.
      </p>
    </div>
  );
}

const meta = {
  title: "Compare/StringReference",
  component: CompareStringReferenceDemo,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof CompareStringReferenceDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
