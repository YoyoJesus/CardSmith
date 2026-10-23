import { describe, expect, it } from "vitest";
import { cardFilename } from "./download";

describe("cardFilename", () => {
  it("slugifies the name and adds the extension", () => {
    expect(cardFilename("Jane  Example", "pdf")).toBe("jane-example-card.pdf");
  });

  it("strips characters that are unsafe in filenames", () => {
    expect(cardFilename('../Jane "J" <Ex>/am:ple?', "typ")).toBe(
      "jane-j-example-card.typ",
    );
  });

  it("keeps accented letters as their base letter", () => {
    expect(cardFilename("Zoë Ångström", "pdf")).toBe("zoe-angstrom-card.pdf");
  });

  it.each(["", "   ", "工程师", "---"])(
    "falls back to business-card for %j",
    (name) => {
      expect(cardFilename(name, "pdf")).toBe("business-card.pdf");
    },
  );
});
