import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { $typst, loadFonts } from "@myriaddreamin/typst.ts";
import { CompileFormatEnum } from "@myriaddreamin/typst.ts/compiler";
import { beforeAll, describe, expect, it } from "vitest";
import {
  defaultData,
  type BusinessCardData,
  type CardLayout,
  type CardSize,
} from "./types";
import { generateTypstCode } from "./typst-generator";

const require = createRequire(import.meta.url);

const layouts: CardLayout[] = ["bar", "classic", "centered", "header"];
const sizes: CardSize[] = ["us", "eu", "square"];

const filled: Partial<BusinessCardData> = {
  name: "Jane Example",
  title: "Engineer",
  company: "Example Co",
  email: "jane@example.test",
  phone: "+1 555 0100",
  website: "example.test",
  location: "Springfield",
  linkedin: "jane-example",
  github: "jane-example",
  twitter: "jane_example",
};

const hostile: Partial<BusinessCardData> = {
  name: 'Jane *Star* _under_ <tag> // not a comment ] [ #let x = 1 $math$ @ref \ "quote"',
  title: "a].at(99, default: panic(1+1))[",
  company: "/* open comment",
  email: 'x"@example.test)',
  phone: "`raw` ~ \n",
  website: "javascript:alert(1)",
  location: "line one\nline two\ttab",
  linkedin: "]] #panic()",
  github: "a/b?c=d&e",
  twitter: "<script>",
};

const unicode: Partial<BusinessCardData> = {
  name: "Zoë Ångström-Łukasz",
  title: "Ingénieure · 工程师",
  company: "Ünïcödé GmbH",
  location: "São Paulo",
};

const inputs: Record<string, Partial<BusinessCardData>> = {
  empty: {},
  filled,
  hostile,
  unicode,
};

const cases = layouts.flatMap((layout) =>
  sizes.flatMap((size) =>
    Object.entries(inputs).map(([input, fields]) => ({
      layout,
      size,
      input,
      data: { ...defaultData, ...fields, layout, size },
    })),
  ),
);

type Compiler = Awaited<ReturnType<typeof $typst.getCompiler>>;
let compiler: Compiler;

beforeAll(async () => {
  $typst.setCompilerInitOptions({
    getModule: () =>
      readFileSync(
        require.resolve("@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm"),
      ),
    // No fonts keeps the test offline. Text is laid out without glyphs, which is enough to catch syntax errors.
    beforeBuild: [loadFonts([], { assets: false })],
  });
  compiler = await $typst.getCompiler();
}, 60_000);

describe("generated Typst compiles", () => {
  it.each(cases)("$layout / $size / $input", async ({ data }) => {
    compiler.addSource("/main.typ", generateTypstCode(data));
    const result = await compiler.compile({
      mainFilePath: "/main.typ",
      format: CompileFormatEnum.pdf,
      diagnostics: "full",
    });

    const errors = (result.diagnostics ?? []).filter(
      (d) => d.severity === "error",
    );
    expect(errors).toEqual([]);
    expect(result.result?.length).toBeGreaterThan(0);
  });
});
