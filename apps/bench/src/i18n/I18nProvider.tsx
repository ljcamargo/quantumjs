'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  LOCALES,
  LOCALE_LABELS,
  detectLocale,
  isLanguagePreference,
  type LanguagePreference,
  type Locale,
} from './config';
import { en, type MessageKey } from './messages/en';
import { es } from './messages/es';

type InterpolationValues = Record<string, string | number>;

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, es };

const PLACEHOLDER = /\{(\w+)\}/g;

function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) return template;
  return template.replace(PLACEHOLDER, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

function readStoredPreference(): LanguagePreference | null {
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguagePreference(raw) ? raw : null;
  } catch {
    return null;
  }
}

function writeStoredPreference(preference: LanguagePreference): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, preference);
  } catch {
    // localStorage can be unavailable (private mode, blocked storage)
  }
}

export type Translate = (
  key: MessageKey,
  values?: InterpolationValues
) => string;

type I18nContextValue = {
  /** Resolved language used for messages and formatting. */
  locale: Locale;
  /** User preference: auto-detect, or a fixed locale. */
  preference: LanguagePreference;
  /** Select a preference and apply it immediately (no reload). */
  setPreference: (preference: LanguagePreference) => void;
  t: Translate;
  formatPercent: (value: number) => string;
  supportedLocales: readonly Locale[];
  localeLabel: (locale: Locale) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] =
    useState<LanguagePreference>('auto');
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  // Restore the stored preference after hydration. Applying it in a task (not
  // synchronously in the effect) keeps SSR/first render consistent and avoids
  // React's set-state-in-effect lint rule.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readStoredPreference();
      const next = stored ?? 'auto';
      setPreferenceState(next);
      setLocale(next === 'auto' ? detectLocale() : next);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Keep the document language in sync for accessibility and typography.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = 'ltr';
  }, [locale]);

  // In auto mode, follow live browser language changes.
  useEffect(() => {
    if (preference !== 'auto') return;

    const onChange = () => setLocale(detectLocale());
    window.addEventListener('languagechange', onChange);
    return () => window.removeEventListener('languagechange', onChange);
  }, [preference]);

  const setPreference = useCallback((next: LanguagePreference) => {
    setPreferenceState(next);
    setLocale(next === 'auto' ? detectLocale() : next);
    writeStoredPreference(next);
  }, []);

  const t = useCallback<Translate>(
    (key, values) => {
      const template = MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key];
      return interpolate(template ?? key, values);
    },
    [locale]
  );

  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [locale]
  );

  const formatPercent = useCallback(
    (value: number) => percentFormatter.format(value),
    [percentFormatter]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      preference,
      setPreference,
      t,
      formatPercent,
      supportedLocales: LOCALES,
      localeLabel: (target) => LOCALE_LABELS[target],
    }),
    [locale, preference, setPreference, t, formatPercent]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}
