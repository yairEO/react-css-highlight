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

