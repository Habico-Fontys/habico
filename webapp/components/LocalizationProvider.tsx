'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { isLocale, translateText, type Locale, type TranslationKey } from '@/lib/localization';
import { useLocalStorageValue } from '@/hooks/useLocalStorageValue';

const STORAGE_KEY = 'habico-taalvoorkeur';

type LocalizationContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: TranslationKey) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);
const translatedAttributes = ['aria-label', 'title', 'placeholder', 'alt'] as const;

function localizeText(
  textNode: Text,
  locale: Locale,
  previousLocale: Locale,
  originalText: WeakMap<Text, string>,
) {
  if (textNode.parentElement?.closest('script, style, noscript')) return;
  const displayed = textNode.data;
  const original = originalText.get(textNode);
  const source =
    original !== undefined && translateText(original, previousLocale) === displayed
      ? original
      : displayed;
  originalText.set(textNode, source);
  textNode.data = translateText(source, locale);
}

function localizeAttribute(
  element: Element,
  attribute: (typeof translatedAttributes)[number],
  locale: Locale,
  previousLocale: Locale,
  originalAttributes: WeakMap<Element, Map<string, string>>,
) {
  const current = element.getAttribute(attribute);
  if (current === null) return;

  let values = originalAttributes.get(element);
  if (!values) {
    values = new Map<string, string>();
    originalAttributes.set(element, values);
  }
  const original = values.get(attribute);
  const source =
    original !== undefined && translateText(original, previousLocale) === current
      ? original
      : current;
  values.set(attribute, source);
  element.setAttribute(attribute, translateText(source, locale));
}

function localizeSubtree(
  root: Node,
  locale: Locale,
  previousLocale: Locale,
  originalText: WeakMap<Text, string>,
  originalAttributes: WeakMap<Element, Map<string, string>>,
) {
  if (root instanceof Text) {
    localizeText(root, locale, previousLocale, originalText);
    return;
  }
  if (!(root instanceof Element) && !(root instanceof DocumentFragment)) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  if (root instanceof Element) {
    for (const attribute of translatedAttributes) {
      localizeAttribute(root, attribute, locale, previousLocale, originalAttributes);
    }
  }
  let node = walker.nextNode();
  while (node) {
    if (node instanceof Text) {
      localizeText(node, locale, previousLocale, originalText);
    } else if (node instanceof Element) {
      for (const attribute of translatedAttributes) {
        localizeAttribute(node, attribute, locale, previousLocale, originalAttributes);
      }
    }
    node = walker.nextNode();
  }
}

function localizeDocument(
  locale: Locale,
  previousLocale: Locale,
  originalText: WeakMap<Text, string>,
  originalAttributes: WeakMap<Element, Map<string, string>>,
) {
  localizeSubtree(document.body, locale, previousLocale, originalText, originalAttributes);

  document.documentElement.lang = locale;
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [locale, setStoredLocale] = useLocalStorageValue(STORAGE_KEY, 'nl', isLocale, {
    onInvalid: 'fallback',
  });
  const previousLocale = useRef<Locale>(locale);
  const originalText = useRef(new WeakMap<Text, string>());
  const originalAttributes = useRef(new WeakMap<Element, Map<string, string>>());

  const setLocale = useCallback(
    (nextLocale: Locale) => setStoredLocale(nextLocale),
    [setStoredLocale],
  );
  const t = useCallback((text: TranslationKey) => translateText(text, locale), [locale]);

  useEffect(() => {
    const activeLocale = previousLocale.current;
    localizeDocument(locale, activeLocale, originalText.current, originalAttributes.current);
    previousLocale.current = locale;

    const observer = new MutationObserver((records) => {
      observer.disconnect();
      for (const record of records) {
        if (record.type === 'characterData' && record.target instanceof Text) {
          localizeText(record.target, locale, locale, originalText.current);
        } else if (record.type === 'attributes' && record.target instanceof Element) {
          const attribute = translatedAttributes.find((item) => item === record.attributeName);
          if (attribute) {
            localizeAttribute(record.target, attribute, locale, locale, originalAttributes.current);
          }
        } else if (record.type === 'childList') {
          for (const addedNode of record.addedNodes) {
            localizeSubtree(
              addedNode,
              locale,
              locale,
              originalText.current,
              originalAttributes.current,
            );
          }
        }
      }
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['aria-label', 'title', 'placeholder', 'alt'],
      });
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'placeholder', 'alt'],
    });
    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}
