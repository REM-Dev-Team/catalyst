import { Font, Select } from '@makeswift/runtime/controls';

export const fontFamilyTokens = {
  heading: Font({
    label: 'Heading',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-dm-serif-text)' },
  }),
  body: Font({
    label: 'Body',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-inter)' },
  }),
  accent: Font({
    label: 'Accent',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-roboto-mono)' },
  }),
  futura: Font({
    label: 'Futura',
    variant: false,
    defaultValue: { fontFamily: '"futura-pt", sans-serif' },
  }),
};

type FontFamilyToken = keyof typeof fontFamilyTokens;
export type FontFamilyCssVar = `var(--font-family-${FontFamilyToken})`;

const fontFamilyCssVar = (token: FontFamilyToken): FontFamilyCssVar =>
  `var(--font-family-${token})`;

const fontFamilyOption = (token: FontFamilyToken): { label: string; value: FontFamilyCssVar | string } => ({
  label: `${fontFamilyTokens[token].config.label}`,
  value: token === 'futura' ? '"futura-pt", sans-serif' : fontFamilyCssVar(token),
});

export const FontFamily = ({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: FontFamilyCssVar | string;
}) =>
  Select({
    label,
    options: [
      fontFamilyOption('heading'), 
      fontFamilyOption('body'), 
      fontFamilyOption('accent'),
      fontFamilyOption('futura'),
    ],
    defaultValue,
  });

FontFamily.Heading = fontFamilyCssVar('heading');
FontFamily.Body = fontFamilyCssVar('body');
FontFamily.Accent = fontFamilyCssVar('accent');
FontFamily.Futura = '"futura-pt", sans-serif';
