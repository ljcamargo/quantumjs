export const LOCALES = ['en', 'es'] as const;

export type Locale = (typeof LOCALES)[number];

/** `auto` means "follow the browser language". */
export type LanguagePreference = 'auto' | Locale;

export const DEFAULT_LOCALE: Locale = 'en';
export const LANGUAGE_STORAGE_KEY = 'bench:language:v1';

/** Language names are shown in their own language, not translated. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

export const LANGUAGE_OPTIONS: readonly LanguagePreference[] = [
  'auto',
  ...LOCALES,
];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.includes(value as Locale);
}

export function isLanguagePreference(
  value: unknown
): value is LanguagePreference {
  return value === 'auto' || isLocale(value);
}

function getBrowserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  const languages = navigator.languages ?? [];
  return navigator.language && !languages.includes(navigator.language)
    ? [...languages, navigator.language]
    : languages;
}

/**
 * Resolve the first supported base language from `navigator.languages`
 * (`es-ES`, `es-419`, `en-US`, ...), falling back to English.
 */
export function detectLocale(
  languages: readonly string[] = getBrowserLanguages()
): Locale {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
