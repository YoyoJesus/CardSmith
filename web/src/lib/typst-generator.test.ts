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

  it("escapes Typst control characters in card text", () => {
    const output = generateTypstCode(
      card({ name: 'A\\B "C" #tag $cash @handle', layout: "classic" }),
    );

    expect(output).toContain('A\\\\B \\"C\\" \\#tag \\$cash \\@handle');
  });

  it("omits empty optional contact fields and normalizes website URLs", () => {
    const output = generateTypstCode(
      card({ website: "example.test", layout: "classic" }),
    );

    expect(output).toContain('link("https://example.test")[example.test]');
    expect(output).not.toContain("mailto:");
    expect(output).not.toContain("linkedin.com");
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
