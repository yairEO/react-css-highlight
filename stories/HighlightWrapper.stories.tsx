import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {HighlightWrapper} from "../src";
import "../src/Highlight.css";
import { AboutHighlightWrapperContent } from "./content";

const meta: Meta<typeof HighlightWrapper> = {
    title: "HighlightWrapper",
    component: HighlightWrapper,
    parameters: {
        layout: "centered",
        docs: {
            description: {
                component:
                    "A convenience wrapper for the Highlight component that manages refs internally. " +
                    "Perfect for simple use cases where you just need to highlight text without managing refs yourself. " +
                    "The wrapper injects a ref into your child element without creating any extra DOM wrapper elements.",
            },
        },
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HighlightWrapper>;

/**
 * Simple example showing the HighlightWrapper in action.
 * No need to manage refs - just wrap your content and specify what to search for.
 */
export const Basic: Story = {
    render: () => {
        return (
            <div style={{ maxWidth: 600 }}>
                <HighlightWrapper search="important">
                    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 4 }}>
                        {AboutHighlightWrapperContent}
                    </div>
                </HighlightWrapper>
            </div>
        );
    },
};

/**
 * Multiple HighlightWrapper instances working together
 * Showcases that wrappers also benefit from automatic range merging
 */
export const MultipleWrappers: Story = {
    render: () => {
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
                        ✨ Multiple HighlightWrapper Instances
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                        All wrappers use the default <code style={{
                            background: "#fff",
                            padding: "2px 6px",
                            borderRadius: 3,
                            fontSize: 13
                        }}>highlightName="highlight"</code> and work perfectly together!
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600 }}>
                        Total highlights: {matchCount1 + matchCount2 + matchCount3}
                    </p>
                </div>

                <HighlightWrapper search="React" onHighlightChange={setMatchCount1}>
                    <div style={{
                        padding: 16,
                        border: "2px solid #e5e7eb",
                        borderRadius: 6,
                        marginBottom: 16,
                        background: "#fff"
                    }}>
                        <h4 style={{ marginTop: 0, marginBottom: 8, color: "#374151" }}>
                            Wrapper 1: React <span style={{
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
                            React makes it easy to create interactive UIs.
                            React efficiently updates and renders components.
                        </p>
                    </div>
                </HighlightWrapper>

                <HighlightWrapper search="library" onHighlightChange={setMatchCount2}>
                    <div style={{
                        padding: 16,
                        border: "2px solid #e5e7eb",
                        borderRadius: 6,
                        marginBottom: 16,
                        background: "#fff"
                    }}>
                        <h4 style={{ marginTop: 0, marginBottom: 8, color: "#374151" }}>
                            Wrapper 2: Libraries <span style={{
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
                            A JavaScript library provides reusable functions and utilities.
                            Every library aims to solve specific problems efficiently.
                            The library ecosystem is vast and growing.
                        </p>
                    </div>
                </HighlightWrapper>

                <HighlightWrapper search="component" onHighlightChange={setMatchCount3}>
                    <div style={{
                        padding: 16,
                        border: "2px solid #e5e7eb",
                        borderRadius: 6,
                        background: "#fff"
                    }}>
                        <h4 style={{ marginTop: 0, marginBottom: 8, color: "#374151" }}>
                            Wrapper 3: Components <span style={{
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
                            A component is a reusable piece of UI.
                            Components can be composed to build complex interfaces.
                            The component-based architecture promotes modularity.
                        </p>
                    </div>
                </HighlightWrapper>
            </div>
        );
    },
};

