import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [wasm(), tailwindcss(), sveltekit()],
  optimizeDeps: {
    exclude: ["@myriaddreamin/typst.ts"],
  },
  build: {
    target: "esnext",
  },
});
