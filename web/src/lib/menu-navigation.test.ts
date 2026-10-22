import { describe, expect, it } from "vitest";
import { nextMenuIndex } from "./menu-navigation";

describe("nextMenuIndex", () => {
  it("moves down and wraps to the first item", () => {
    expect(nextMenuIndex("ArrowDown", 0, 3)).toBe(1);
    expect(nextMenuIndex("ArrowDown", 2, 3)).toBe(0);
  });

  it("moves up and wraps to the last item", () => {
    expect(nextMenuIndex("ArrowUp", 2, 3)).toBe(1);
    expect(nextMenuIndex("ArrowUp", 0, 3)).toBe(2);
  });

  it("starts from the ends when focus is outside the menu", () => {
    expect(nextMenuIndex("ArrowDown", -1, 3)).toBe(0);
    expect(nextMenuIndex("ArrowUp", -1, 3)).toBe(2);
    expect(nextMenuIndex("ArrowDown", 7, 3)).toBe(0);
  });

  it("jumps with Home and End", () => {
    expect(nextMenuIndex("Home", 2, 3)).toBe(0);
    expect(nextMenuIndex("End", 0, 3)).toBe(2);
  });

  it("ignores other keys and empty menus", () => {
    expect(nextMenuIndex("Enter", 0, 3)).toBeNull();
    expect(nextMenuIndex("ArrowDown", 0, 0)).toBeNull();
  });
});
