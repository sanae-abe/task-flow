/**
 * i18n Module Entry Point
 *
 * This module provides internationalization functionality for the TaskFlow application.
 * Currently contains translation resources for Japanese (ja) and English (en).
 */

import jaTranslations from './locales/ja.json';
import enTranslations from './locales/en.json';

export type {
  Locale,
  TranslationNamespace,
  TranslationKey,
  NestedTranslationKey,
  TranslationResources,
  InterpolationVariables,
  TranslateFn,
  NamespaceTranslateFn,
} from './types';

/**
 * Available translation resources
 */
export const resources = {
  ja: jaTranslations,
  en: enTranslations,
} as const;

/**
 * Default locale
 */
export const defaultLocale = 'ja' as const;

/**
 * Supported locales
 */
export const supportedLocales = ['ja', 'en'] as const;

/**
 * Simple translation function (for testing/fallback)
 *
 * @param key - Translation key in format "namespace.key"
 * @param locale - Locale to use (default: 'ja')
 * @param variables - Interpolation variables
 * @returns Translated string
 */
export const translate = (
  key: string,
  locale: 'ja' | 'en' = 'ja',
  variables?: Record<string, string | number>
): string => {
  const [namespace, ...keyParts] = key.split('.');
  const translationKey = keyParts.join('.');

  const translations = resources[locale];
  const namespaceTranslations =
    translations[namespace as keyof typeof translations];

  if (!namespaceTranslations) {
    console.warn(`Translation namespace not found: ${namespace}`);
    return key;
  }

  let translation = namespaceTranslations[
    translationKey as keyof typeof namespaceTranslations
  ] as string;

  if (!translation) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  // Simple variable interpolation
  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      translation = translation.replace(`{{${varKey}}}`, String(value));
    });
  }

  return translation;
};

/**
 * Type-safe translation key builder
 *
 * @example
 * ```ts
 * const key = buildKey('task', 'create'); // Returns "task.create"
 * ```
 */
export const buildKey = <NS extends keyof typeof jaTranslations>(
  namespace: NS,
  key: keyof (typeof jaTranslations)[NS]
): string => `${namespace}.${String(key)}`;

/**
 * Locale display names
 */
export const localeNames: Record<
  'ja' | 'en',
  { native: string; english: string }
> = {
  ja: {
    native: '日本語',
    english: 'Japanese',
  },
  en: {
    native: 'English',
    english: 'English',
  },
};

export default {
  resources,
  defaultLocale,
  supportedLocales,
  translate,
  buildKey,
  localeNames,
};
