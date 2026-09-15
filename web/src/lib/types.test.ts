import { describe, expect, it } from "vitest";
import {
  defaultData,
  MAX_CARD_FIELD_LENGTH,
  sanitizeStoredCardData,
} from "./types";

describe("sanitizeStoredCardData", () => {
  it("keeps valid saved fields", () => {
    expect(
      sanitizeStoredCardData({
        name: "Morgan Example",
        layout: "centered",
        size: "eu",
        primaryColor: "aBc123",
      }),
    ).toMatchObject({
      name: "Morgan Example",
      layout: "centered",
      size: "eu",
      primaryColor: "aBc123",
    });
  });

  it("discards malformed, oversized, and unsafe saved fields", () => {
    expect(
      sanitizeStoredCardData({
        name: 123,
        title: "x".repeat(MAX_CARD_FIELD_LENGTH + 1),
        layout: "diagonal",
        size: "poster",
        primaryColor: '000000\") + panic(1) + rgb(\"000000',
        textColor: "zzz",
      }),
    ).toEqual(defaultData);
  });

  it("falls back to defaults for non-object storage data", () => {
    expect(sanitizeStoredCardData(null)).toEqual(defaultData);
    expect(sanitizeStoredCardData(["not", "card", "data"])).toEqual(
      defaultData,
    );
  });

  it("rejects array values that stringify to supported enums", () => {
    expect(
      sanitizeStoredCardData({ layout: ["header"], size: ["square"] }),
    ).toMatchObject({ layout: defaultData.layout, size: defaultData.size });
  });
});
