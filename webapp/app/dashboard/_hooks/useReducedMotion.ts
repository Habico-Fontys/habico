"use client";

import { useCallback, useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(onChange?: (matches: boolean) => void) {
  const subscribe = useCallback((notify: () => void) => {
    const preference = window.matchMedia(query);
    function handleChange(event: MediaQueryListEvent) {
      onChange?.(event.matches);
      notify();
    }

    preference.addEventListener("change", handleChange);
    return () => preference.removeEventListener("change", handleChange);
  }, [onChange]);

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, []);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
