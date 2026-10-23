import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    // Emitted as a <meta> tag with a hash for SvelteKit's inline bootstrap script. frame-ancestors cannot be set from
    // a meta tag, so vercel.json sends it as a header.
    csp: {
      mode: "hash",
      directives: {
        "default-src": ["self"],
        // The typst.ts compiler's wasm-bindgen glue calls `Function("return this")` during startup.
        "script-src": ["self", "wasm-unsafe-eval", "unsafe-eval"],
        "style-src": ["self", "unsafe-inline"],
        "img-src": ["self", "blob:", "data:"],
        // typst.ts downloads its default fonts from jsDelivr.
        "connect-src": ["self", "https://cdn.jsdelivr.net"],
        "font-src": ["self"],
        "object-src": ["none"],
        "base-uri": ["self"],
        "form-action": ["self"],
      },
    },
  },
};

export default config;
