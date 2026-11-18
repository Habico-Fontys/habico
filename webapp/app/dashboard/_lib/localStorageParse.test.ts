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
    const options = { onInvalid };

    it("returns the initial value for a null raw value", () => {
      expect(
        parseLocalStorageValue("settings", null, initialValue, isSettings, options),
      ).toBe(initialValue);
    });

    it("parses a valid value", () => {
      expect(
        parseLocalStorageValue(
          "settings",
          '{"enabled":true}',
          initialValue,
          isSettings,
          options,
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
            options,
          ),
        ).toBe(initialValue);
      } else {
        expect(() =>
          parseLocalStorageValue(
            "settings",
            "{",
            initialValue,
            isSettings,
            options,
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
            options,
          ),
        ).toBe(initialValue);
      } else {
        expect(() =>
          parseLocalStorageValue(
            "settings",
            '{"enabled":"yes"}',
            initialValue,
            isSettings,
            options,
          ),
        ).toThrow('Opgeslagen gegevens voor "settings" hebben een ongeldig formaat.');
      }
    });
  },
);
