import { copyFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

mkdirSync(join(root, "static"), { recursive: true });

const files = [
  [
    "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
    "typst_ts_web_compiler_bg.wasm",
  ],
  [
    "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
    "typst_ts_renderer_bg.wasm",
  ],
];

for (const [src, dest] of files) {
  copyFileSync(join(root, "node_modules", src), join(root, "static", dest));
  console.log(`Copied ${dest}`);
}
