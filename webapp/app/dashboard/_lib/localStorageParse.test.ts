import { describe, expect, it } from "vitest";
import { parseLocalStorageValue } from "../../../hooks/localStorageParse";

type Settings = { enabled: boolean };
const initialValue: Settings = { enabled: false };
const isSettings = (value: unknown): value is Settings =>
  typeof value === "object" &&
  value !== null &&
  "enabled" in value &&
  typeof value.enabled === "boolean";

describe.each(["throw", "fallback"] as const)(
  "parseLocalStorageValue with onInvalid=%s",
  (onInvalid) => {
    it("returns the initial value for a null raw value", () => {
      expect(
        parseLocalStorageValue("settings", null, initialValue, isSettings, onInvalid),
      ).toBe(initialValue);
    });

    it("parses a valid value", () => {
      expect(
        parseLocalStorageValue(
          "settings",
          '{"enabled":true}',
          initialValue,
          isSettings,
          onInvalid,
        ),
      ).toEqual({ enabled: true });
    });

    it("handles malformed JSON according to the mode", () => {
      if (onInvalid === "fallback") {
        expect(
          parseLocalStorageValue(
            "settings",
            "{",
            initialValue,
            isSettings,
            onInvalid,
          ),
        ).toBe(initialValue);
      } else {
        expect(() =>
          parseLocalStorageValue(
            "settings",
            "{",
            initialValue,
            isSettings,
            onInvalid,
          ),
        ).toThrow(SyntaxError);
      }
    });

    it("handles a value with an invalid shape according to the mode", () => {
      if (onInvalid === "fallback") {
        expect(
          parseLocalStorageValue(
            "settings",
            '{"enabled":"yes"}',
            initialValue,
            isSettings,
            onInvalid,
          ),
        ).toBe(initialValue);
      } else {
        expect(() =>
          parseLocalStorageValue(
            "settings",
            '{"enabled":"yes"}',
            initialValue,
            isSettings,
            onInvalid,
          ),
        ).toThrow('Opgeslagen gegevens voor "settings" hebben een ongeldig formaat.');
      }
    });
  },
);
