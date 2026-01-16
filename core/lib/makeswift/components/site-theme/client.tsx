/* eslint-disable @typescript-eslint/consistent-type-definitions */
'use client';

import {
  type FontFamilyTokens,
  fontTokensToCssVars,
  type ThemeProps,
  themeToCssVars,
} from './to-css';

type TokensProps = {
  fontTokens: FontFamilyTokens;
};

/**
 * Normalizes old font values to new CSS variable format
 * Handles migration from old format like "futura-pt", sans-serif to var(--font-family-*)
 * @param {string | undefined} value - The font family value (old format or CSS variable)
 * @returns {string} The normalized CSS variable format
 */
function normalizeFontFamily(value: string | undefined): string {
  if (!value) {
    return 'var(--font-family-inter)'; // Default fallback
  }

  // If already a CSS variable, return as-is
  if (value.startsWith('var(--font-family-')) {
    return value;
  }

  // If already a valid font family string (like Futura PT from Adobe Fonts), return as-is
  if (value.includes('futura-pt') || value.includes('futura pt')) {
    return value;
  }

  // Map common old font names to new CSS variables
  const fontMapping: Record<string, string> = {
    inter: 'var(--font-family-body)',
    'roboto mono': 'var(--font-family-accent)',
    roboto: 'var(--font-family-body)',
  };

  // Extract font name from old format (e.g., "futura-pt", sans-serif -> futura-pt)
  const fontName = value.replace(/['"]/g, '').split(',')[0]?.trim().toLowerCase() ?? '';

  // Check if we have a mapping
  if (fontMapping[fontName]) {
    return fontMapping[fontName];
  }

  // Default to body font if no mapping found
  return 'var(--font-family-body)';
}

/**
 * Normalizes font tokens, converting old format values to new CSS variables
 * @param {FontFamilyTokens | undefined} tokens - The font tokens to normalize (may be undefined)
 * @returns {FontFamilyTokens} Normalized font tokens with CSS variable format
 */
function normalizeFontTokens(tokens: FontFamilyTokens | undefined): FontFamilyTokens {
  if (!tokens) {
    return {
      heading: { fontFamily: 'var(--font-family-heading)' },
      body: { fontFamily: 'var(--font-family-body)' },
      accent: { fontFamily: 'var(--font-family-accent)' },
    };
  }

  return Object.entries(tokens).reduce<FontFamilyTokens>((acc, [key, value]) => {
    acc[key] = {
      fontFamily: normalizeFontFamily(value.fontFamily),
    };

    return acc;
  }, {});
}

export const SiteTheme = ({ fontTokens, ...theme }: TokensProps & ThemeProps) => (
  <style data-makeswift="theme">{`:root {
      ${fontTokensToCssVars(fontTokens).join('\n')}
      ${themeToCssVars(theme).join('\n')}
      /* Variable aliases for backward compatibility */
      --font-family-mono: var(--font-family-accent);
      --button-primary-text: var(--button-primary-foreground);
      --button-secondary-text: var(--button-secondary-foreground);
      --button-tertiary-text: var(--button-tertiary-foreground);
      --button-ghost-text: var(--button-ghost-foreground);
      --button-danger-text: var(--button-danger-foreground);
    }
  `}</style>
);

type Props = {
  fontTokens?: FontFamilyTokens;
  components?: ThemeProps & { header?: ThemeProps };
};

export const MakeswiftSiteTheme = ({ fontTokens, components }: Props) => {
  // Normalize font tokens to handle old format values or validation failures
  const normalizedFontTokens = normalizeFontTokens(fontTokens);

  // Handle case where components is undefined (validation failure fallback)
  if (!components) {
    return <SiteTheme fontTokens={normalizedFontTokens} />;
  }

  const { header, ...restComponents } = components;

  return (
    <SiteTheme {...{ fontTokens: normalizedFontTokens, ...(header ?? {}), ...restComponents }} />
  );
};
