import { isInsideIframe } from "Lib/iframe";

describe("iframe", () => {
  describe("isInsideIframe", () => {
    it("returns false when parent location is identitical to window location", () => {
      expect(window.location).toEqual(window.parent.location);

      expect(isInsideIframe()).toBe(false);
    });

    it("returns true when parent location is not identitical to window location", () => {
      Object.defineProperty(window, "parent", {
        writable: true,
        value: {
          location: {},
        },
      });
      expect(window.location).not.toEqual(window.parent.location);

      expect(isInsideIframe()).toBe(true);
    });
  });
});
