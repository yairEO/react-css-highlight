/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
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