import type { Meta, StoryObj } from "@storybook/react";
import HighlightWrapper from "../src/HighlightWrapper";
import "../src/Highlight.css";

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
                        <h2>About the HighlightWrapper</h2>
                        <p>
                            This is an important message about important topics. The wrapper
                            pattern is important for simple use cases where you don't need multiple
                            highlights or advanced features.
                        </p>
                        <p>
                            Notice how you don't need to manage refs manually - the wrapper handles
                            it for you! This is important for developer experience and keeps your
                            code clean and simple.
                        </p>
                        <p>
                            The HighlightWrapper component is perfect when you have a single
                            highlight target and want the simplest possible API. For more advanced
                            use cases like multiple highlights on the same content, use the
                            Highlight component directly with refs.
                        </p>
                    </div>
                </HighlightWrapper>
            </div>
        );
    },
};

