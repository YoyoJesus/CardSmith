import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FOOTER_STORAGE_KEY, footerStore } from "./footer-store";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

describe("footerStore", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
    footerStore.loadFromStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts visible", () => {
    expect(get(footerStore)).toBe(false);
  });

  it("persists the hidden preference and clears it when shown again", () => {
    footerStore.toggle();
    footerStore.saveToStorage();
    expect(localStorage.getItem(FOOTER_STORAGE_KEY)).toBe("true");

    footerStore.toggle();
    footerStore.saveToStorage();
    expect(localStorage.getItem(FOOTER_STORAGE_KEY)).toBeNull();
  });

  it("restores a saved preference", () => {
    localStorage.setItem(FOOTER_STORAGE_KEY, "true");
    footerStore.loadFromStorage();
    expect(get(footerStore)).toBe(true);
  });

  it("keeps the current preference when storage is blocked", () => {
    footerStore.toggle();
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
    });
    footerStore.loadFromStorage();
    expect(get(footerStore)).toBe(true);
  });
});
