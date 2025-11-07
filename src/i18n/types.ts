/**
 * i18n Type Definitions
 *
 * Provides type-safe access to translation keys
 */

import type ja from './locales/ja.json';

/**
 * Supported locale types
 */
export type Locale = 'ja' | 'en';

/**
 * Translation namespace types
 */
export type TranslationNamespace = keyof typeof ja;

/**
 * Translation key type for a given namespace
 */
export type TranslationKey<NS extends TranslationNamespace> =
  keyof (typeof ja)[NS];

/**
 * Nested translation key type (for deep access)
 */
export type NestedTranslationKey = {
  [K in TranslationNamespace]: `${K}.${Extract<keyof (typeof ja)[K], string>}`;
}[TranslationNamespace];

/**
 * Translation resources type
 */
export interface TranslationResources {
  ja: typeof ja;
  en: typeof ja; // Same structure as Japanese
}

/**
 * Translation interpolation variables
 */
export type InterpolationVariables = Record<string, string | number>;

/**
 * Translation function type
 */
export type TranslateFn = (
  key: NestedTranslationKey,
  variables?: InterpolationVariables
) => string;

/**
 * Namespace-specific translation function type
 */
export type NamespaceTranslateFn<NS extends TranslationNamespace> = (
  key: TranslationKey<NS>,
  variables?: InterpolationVariables
) => string;
