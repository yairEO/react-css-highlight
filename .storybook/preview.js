import { definePreview } from '@storybook/react-vite';
import './preview.css';
import { withVisualFullPage } from './decorators/withVisualFullPage';

export default definePreview({
    decorators: [withVisualFullPage],
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