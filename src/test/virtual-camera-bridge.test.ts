import { describe, expect, it } from "vitest";
import { isCompanion, rgbaToRgb, vcam } from "@/lib/weechat/virtual-camera-bridge";

describe("virtual camera bridge", () => {
  it("is inactive in a normal browser", async () => {
    expect(isCompanion()).toBe(false);
    await expect(vcam("status")).rejects.toThrow(/Windows/);
  });
  it("drops the alpha channel", () => {
    const out = rgbaToRgb(new Uint8ClampedArray([1, 2, 3, 255, 4, 5, 6, 0]));
    expect(Array.from(out)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
