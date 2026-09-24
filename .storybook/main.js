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

    // GitHub Pages project site. Actions always sets CI, including the
    // Storybook Tests workflow, which serves this build at /. Only the
    // Pages workflow should use the subpath.
    config.base =
      process.env.GITHUB_WORKFLOW === "Deploy Storybook & Demos to GitHub Pages"
        ? "/react-css-highlight/"
        : "/";

    return config;
  },

  addons: ["@storybook/addon-vitest"]
};
export default config;