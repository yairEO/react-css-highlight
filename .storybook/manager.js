import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: '⚛️ React-CSS-Highlight',
    brandUrl: 'https://github.com/yairEO/react-css-highlight',
    brandTarget: '_blank',
    fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontCode: 'monospace',
    // Increase brand title size through typography scale
    typography: {
      size: {
        s1: 13,
        s2: 14,
        s3: 16,
        m1: 20,
        m2: 24,
        m3: 28,
        l1: 32,
        l2: 40,
        l3: 48,
      },
    },
  }),
});

