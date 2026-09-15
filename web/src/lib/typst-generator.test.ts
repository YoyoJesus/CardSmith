import { describe, expect, it } from "vitest";
import { defaultData, type BusinessCardData } from "./types";
import { generateTypstCode } from "./typst-generator";

function card(overrides: Partial<BusinessCardData> = {}): BusinessCardData {
  return { ...defaultData, ...overrides };
}

describe("generateTypstCode", () => {
  it("uses exact dimensions for every supported card size", () => {
    expect(generateTypstCode(card({ size: "us" }))).toContain(
      "width: 3.5in, height: 2in",
    );
    expect(generateTypstCode(card({ size: "eu" }))).toContain(
      "width: 85mm, height: 55mm",
    );
    expect(generateTypstCode(card({ size: "square" }))).toContain(
      "width: 2.5in, height: 2.5in",
    );
  });

  it("renders user text as a Typst string literal", () => {
    const output = generateTypstCode(
      card({ name: 'A\\B "C" #tag $cash @handle', layout: "classic" }),
    );

    expect(output).toContain(
      'fill: primary-color, "A\\\\B \\"C\\" #tag $cash @handle"',
    );
  });

  it("omits empty optional contact fields and normalizes website URLs", () => {
    const output = generateTypstCode(
      card({ website: "example.test", layout: "classic" }),
    );

    expect(output).toContain('link("https://example.test", "example.test")');
    expect(output).not.toContain("mailto:");
    expect(output).not.toContain("linkedin.com");
  });

  it.each(["httpbin.org", "httpcats.com/path"])(
    "adds a protocol to %s",
    (website) => {
      expect(generateTypstCode(card({ website }))).toContain(
        `link("https://${website}", "${website}")`,
      );
    },
  );

  it("preserves an explicit HTTP or HTTPS protocol case-insensitively", () => {
    expect(
      generateTypstCode(card({ website: "HTTP://example.test/path" })),
    ).toContain('link("HTTP://example.test/path", "example.test/path")');
  });

  it.each([
    "a].at(99, default: panic(1+1))[",
    "Jane *Star",
    "_jane",
    "O`Neil",
    "A <b",
    "Jane // Doe",
  ])("keeps potentially active markup inside a string literal: %s", (name) => {
    const output = generateTypstCode(card({ name, layout: "classic" }));
    const escaped = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    expect(output).toContain(`fill: primary-color, "${escaped}"`);
    expect(output).not.toContain(`)[${name}]`);
  });

  it("keeps social handles and URL paths inside string literals", () => {
    const output = generateTypstCode(
      card({ twitter: "_jane", website: "http://example.com//a" }),
    );

    expect(output).toContain('link("https://x.com/_jane", "x.com/_jane")');
    expect(output).toContain('link("http://example.com//a", "example.com//a")');
  });

  it("falls back to safe colors if runtime data bypasses validation", () => {
    const output = generateTypstCode(
      card({
        primaryColor: '000000\") + panic(1) + rgb(\"000000',
        textColor: "zzz",
      }),
    );

    expect(output).toContain('#let primary-color = rgb("22327F")');
    expect(output).toContain('#let text-color = rgb("1b1b1b")');
    expect(output).not.toContain("panic(1)");
  });

  it.each(["bar", "classic", "centered", "header"] as const)(
    "generates the %s layout",
    (layout) => {
      const output = generateTypstCode(
        card({ layout, name: "Morgan Example" }),
      );
      expect(output).toContain("Morgan Example");
      expect(output).toContain("#set page(");
    },
  );
});
