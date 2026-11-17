"use client";

import { useCallback, useSyncExternalStore, type SetStateAction } from "react";

type Validator<T> = (value: unknown) => value is T;

const noServerValue = () => null;
const eventName = (key: string) => `habico:local-storage:${key}`;

function isUpdater<T>(
  action: SetStateAction<T>,
): action is (current: T) => T {
  return typeof action === "function";
}

function parseValue<T>(key: string, rawValue: string, isValid: Validator<T>): T {
  const value: unknown = JSON.parse(rawValue);
  if (!isValid(value)) {
    throw new Error(`Opgeslagen gegevens voor "${key}" hebben een ongeldig formaat.`);
  }
  return value;
}

function subscribeToValue(key: string, notify: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) notify();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(eventName(key), notify);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(eventName(key), notify);
  };
}

export function useLocalStorageValue<T>(
  key: string,
  initialValue: T,
  isValid: Validator<T>,
) {
  const subscribe = useCallback(
    (notify: () => void) => subscribeToValue(key, notify),
    [key],
  );
  const getSnapshot = useCallback(() => localStorage.getItem(key), [key]);
  const rawValue = useSyncExternalStore(subscribe, getSnapshot, noServerValue);
  const value =
    rawValue === null ? initialValue : parseValue(key, rawValue, isValid);

  const setValue = useCallback(
    (action: SetStateAction<T>) => {
      const savedValue = localStorage.getItem(key);
      const currentValue =
        savedValue === null
          ? initialValue
          : parseValue(key, savedValue, isValid);
      const nextValue = isUpdater(action) ? action(currentValue) : action;

      if (!isValid(nextValue)) {
        throw new Error(`Nieuwe gegevens voor "${key}" hebben een ongeldig formaat.`);
      }

      const serialized = JSON.stringify(nextValue);
      if (serialized === undefined) {
        throw new Error(`Gegevens voor "${key}" konden niet worden omgezet naar JSON.`);
      }

      localStorage.setItem(key, serialized);
      window.dispatchEvent(new Event(eventName(key)));
    },
    [initialValue, isValid, key],
  );

  return [value, setValue] as const;
}
