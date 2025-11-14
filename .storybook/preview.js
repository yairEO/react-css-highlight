import { definePreview } from '@storybook/react-vite';
import './preview.css';

export default definePreview({
    parameters: {
        docs: {
            codePanel: true,
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
})