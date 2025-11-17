import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  base: './',
  resolve: {
    alias: [
      {
        find: 'react-css-highlight/styles',
        replacement: resolve(__dirname, '../../src/Highlight.css'),
      },
      {
        find: 'react-css-highlight/vanilla',
        replacement: resolve(__dirname, '../../src/vanilla/index.ts'),
      },
      {
        find: 'react-css-highlight',
        replacement: resolve(__dirname, '../../src'),
      },
    ],
  },
  server: {
    port: 3000,
    open: true,
  },
};

