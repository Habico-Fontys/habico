"use client";

import { useSyncExternalStore } from "react";

let vandaag: Date | null = null;
const abonnees = new Set<() => void>();

function bijwerken() {
  vandaag = new Date();
  abonnees.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  abonnees.add(notify);
  if (abonnees.size === 1) {
    window.addEventListener("focus", bijwerken);
    window.addEventListener("storage", bijwerken);
  }
  if (vandaag === null) {
    vandaag = new Date();
    notify();
  }

  return () => {
    abonnees.delete(notify);
    if (abonnees.size === 0) {
      window.removeEventListener("focus", bijwerken);
      window.removeEventListener("storage", bijwerken);
      vandaag = null;
    }
  };
}

function getSnapshot() {
  return vandaag;
}

function getServerSnapshot() {
  return null;
}

export function useVandaag() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
