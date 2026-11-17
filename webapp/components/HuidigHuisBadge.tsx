'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CURRENT_HOUSE_CHANGE_EVENT,
  CURRENT_HOUSE_STORAGE_KEY,
  type StoredHouse,
} from '@/lib/huis';

const DEFAULT_HOUSE: StoredHouse = {
  id: 'maple-house',
  name: 'Maple House',
};

function readStoredHouse(): StoredHouse {
  try {
    const stored = localStorage.getItem(CURRENT_HOUSE_STORAGE_KEY);
    if (!stored) return DEFAULT_HOUSE;

    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as Record<string, unknown>).id === 'string' &&
      typeof (parsed as Record<string, unknown>).name === 'string'
    ) {
      return {
        id: (parsed as Record<string, string>).id,
        name: (parsed as Record<string, string>).name,
      };
    }
  } catch {
    return DEFAULT_HOUSE;
  }

  return DEFAULT_HOUSE;
}

export function useHuidigHuis() {
  const [house, setHouse] = useState(DEFAULT_HOUSE);

  useEffect(() => {
    const updateHouse = () => setHouse(readStoredHouse());
    updateHouse();
    window.addEventListener('storage', updateHouse);
    window.addEventListener(CURRENT_HOUSE_CHANGE_EVENT, updateHouse);
    return () => {
      window.removeEventListener('storage', updateHouse);
      window.removeEventListener(CURRENT_HOUSE_CHANGE_EVENT, updateHouse);
    };
  }, []);

  return house;
}

export function HuidigHuisBadge() {
  const house = useHuidigHuis();

  return (
    <Link
      href="/dashboard/huisgenoten/wisselen"
      aria-label={`Huidig huis: ${house.name}. Huiscode beheren`}
      className="border-habico-grey/80 bg-habico-white text-habico-blue/70 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold transition hover:border-tangy-blue hover:text-tangy-blue"
    >
      <span className="bg-habico-orange size-2 rounded-full" />
      {house.name}
    </Link>
  );
}
