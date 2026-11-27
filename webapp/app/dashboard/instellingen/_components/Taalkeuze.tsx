'use client';

import { useState } from 'react';
import { isLocale, type Locale } from '@/lib/localization';
import { useLocalization } from '@/components/LocalizationProvider';

const taalOpties: { code: Locale; naam: string }[] = [
  { code: 'nl', naam: 'Nederlands' },
  { code: 'en', naam: 'English' },
  { code: 'es', naam: 'Español' },
  { code: 'fr', naam: 'Français' },
  { code: 'de', naam: 'Deutsch' },
  { code: 'it', naam: 'Italiano' },
  { code: 'pt', naam: 'Português' },
  { code: 'zh', naam: '中文' },
];

export function Taalkeuze() {
  const { locale, setLocale, t } = useLocalization();
  const [draft, setDraft] = useState<Locale | null>(null);
  const [saveError, setSaveError] = useState(false);
  const selectedLocale = draft ?? locale;
  const isSaved = selectedLocale === locale;

  return (
    <div className="mt-5 max-w-sm">
      <label
        htmlFor="voorkeurstaal"
        className="text-habico-navy-dark mb-2 block text-sm font-semibold"
      >
        {t('Taal')}
      </label>
      <select
        id="voorkeurstaal"
        value={selectedLocale}
        onChange={(event) => {
          const value = event.currentTarget.value;
          if (!isLocale(value)) return;
          setDraft(value);
          setSaveError(false);
        }}
        className="border-habico-grey bg-habico-white text-habico-navy-dark focus:border-tangy-blue focus:ring-tangy-blue/20 min-h-11 w-full rounded-xl border px-3 text-sm focus:ring-4 focus:outline-none"
      >
        {taalOpties.map((optie) => (
          <option key={optie.code} value={optie.code}>
            {optie.naam}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={isSaved}
        onClick={() => {
          if (!draft) return;
          try {
            setLocale(draft);
          } catch {
            setSaveError(true);
          }
        }}
        className="instellingen-opslaan bg-habico-navy-dark mt-3 min-h-11 rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaved ? t('Opgeslagen') : t('Opslaan')}
      </button>
      {saveError && (
        <p role="alert" className="text-fire-orange mt-2 text-xs">
          {t('Je taalvoorkeur kon niet worden opgeslagen. Controleer de browserinstellingen.')}
        </p>
      )}
    </div>
  );
}
