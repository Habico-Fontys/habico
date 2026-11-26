import { describe, expect, it } from 'vitest';
import { isLocale, LOCALES, translateText } from '../../../lib/localization';
import { euro } from './euro';

describe('localization', () => {
  it('accepts only supported locale codes', () => {
    expect(LOCALES).toHaveLength(8);
    expect(isLocale('zh')).toBe(true);
    expect(isLocale('nl-NL')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it.each([
    ['en', 'Save'],
    ['es', 'Guardar'],
    ['fr', 'Enregistrer'],
    ['de', 'Speichern'],
    ['it', 'Salva'],
    ['pt', 'Guardar'],
    ['zh', '保存'],
  ] as const)('translates interface text to %s', (locale, expected) => {
    expect(translateText('Opslaan', locale)).toBe(expected);
  });

  it('preserves Dutch and leaves unknown or user-provided text unchanged', () => {
    expect(translateText('Opslaan', 'nl')).toBe('Opslaan');
    expect(translateText('Mila', 'en')).toBe('Mila');
  });

  it('formats currency using the selected locale', () => {
    expect(euro(12.5)).toBe(euro(12.5, 'nl'));
    expect(euro(12.5, 'en')).not.toBe(euro(12.5, 'nl'));
  });
});
