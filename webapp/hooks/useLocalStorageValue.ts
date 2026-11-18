"use client";

import { useCallback, useSyncExternalStore, type SetStateAction } from "react";
import {
  parseLocalStorageValue,
  type LocalStorageParseOptions,
} from "./localStorageParse";

type Validator<T> = (value: unknown) => value is T;

const noServerValue = () => null;
const eventName = (key: string) => `habico:local-storage:${key}`;

function isUpdater<T>(
  action: SetStateAction<T>,
): action is (current: T) => T {
  return typeof action === "function";
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
  options?: LocalStorageParseOptions,
) {
  const subscribe = useCallback(
    (notify: () => void) => subscribeToValue(key, notify),
    [key],
  );
  const getSnapshot = useCallback(() => localStorage.getItem(key), [key]);
  const rawValue = useSyncExternalStore(subscribe, getSnapshot, noServerValue);
  const value = parseLocalStorageValue(
    key,
    rawValue,
    initialValue,
    isValid,
    options,
  );

  const setValue = useCallback(
    (action: SetStateAction<T>) => {
      const savedValue = localStorage.getItem(key);
      const currentValue = parseLocalStorageValue(
        key,
        savedValue,
        initialValue,
        isValid,
        options,
      );
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
    [initialValue, isValid, key, options],
  );

  return [value, setValue] as const;
}
