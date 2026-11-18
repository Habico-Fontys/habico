type Validator<T> = (value: unknown) => value is T;

export type LocalStorageParseOptions = {
  onInvalid?: "throw" | "fallback";
};

export function parseLocalStorageValue<T>(
  key: string,
  rawValue: string | null,
  initialValue: T,
  isValid: Validator<T>,
  onInvalid: LocalStorageParseOptions["onInvalid"] = "throw",
): T {
  if (rawValue === null) return initialValue;

  let value: unknown;
  try {
    value = JSON.parse(rawValue);
  } catch (error) {
    if (onInvalid === "fallback") return initialValue;
    throw error;
  }

  if (!isValid(value)) {
    if (onInvalid === "fallback") return initialValue;
    throw new Error(`Opgeslagen gegevens voor "${key}" hebben een ongeldig formaat.`);
  }

  return value;
}
