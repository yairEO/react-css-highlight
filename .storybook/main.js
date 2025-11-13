/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  async viteFinal(config) {
    // Configure JSX transform for React 19 automatic runtime
    config.esbuild = config.esbuild || {};
    config.esbuild.jsx = 'automatic';

    // Set base path for GitHub Pages
    config.base = process.env.CI ? '/react-css-highlight/' : '/';

    return config;
  }
};
export default config;