import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'vanilla/index': 'src/vanilla/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', /\.css$/],
  outExtension() {
    return {
      js: `.js`,
    };
  },
  onSuccess: 'cp src/Highlight.css dist/Highlight.css',
});
