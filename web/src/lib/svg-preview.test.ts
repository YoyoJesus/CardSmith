import { describe, expect, it } from "vitest";
import { previewSvgBlob, previewSvgMarkup } from "./svg-preview";

describe("previewSvgMarkup", () => {
  it("removes every script element, including ones with attributes and odd casing", () => {
    const svg =
      '<svg><path d="M0 0"/><script type="text/javascript">if (a && b) run()</script>' +
      "<SCRIPT>alert(1)</SCRIPT ></svg>";

    expect(previewSvgMarkup(svg)).toBe('<svg><path d="M0 0"/></svg>');
  });

  it("leaves SVG without scripts unchanged", () => {
    const svg =
      '<svg viewBox="0 0 10 10"><a href="https://example.test"><path d="M0 0"/></a></svg>';

    expect(previewSvgMarkup(svg)).toBe(svg);
  });
});

describe("previewSvgBlob", () => {
  it("creates an SVG image blob without scripts", async () => {
    const blob = previewSvgBlob("<svg><script>x</script></svg>");

    expect(blob.type).toBe("image/svg+xml");
    expect(await blob.text()).toBe("<svg></svg>");
  });
});
