import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [wasm(), topLevelAwait(), tailwindcss(), sveltekit()],
	optimizeDeps: {
		exclude: ['@myriaddreamin/typst.ts']
	},
	build: {
		target: 'esnext'
	}
});
