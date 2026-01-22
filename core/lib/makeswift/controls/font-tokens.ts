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
};

type FontFamilyToken = keyof typeof fontFamilyTokens;
export type FontFamilyCssVar = `var(--font-family-${FontFamilyToken})` | '"futura-pt", sans-serif';

const fontFamilyCssVar = (token: FontFamilyToken): `var(--font-family-${FontFamilyToken})` =>
  `var(--font-family-${token})`;

const fontFamilyOption = (token: FontFamilyToken): { label: string; value: FontFamilyCssVar } => ({
  label: `${fontFamilyTokens[token].config.label}`,
  value: fontFamilyCssVar(token),
});

const futuraPtOption: { label: string; value: FontFamilyCssVar } = {
  label: 'Futura PT (Adobe Fonts)',
  value: '"futura-pt", sans-serif',
};

export const FontFamily = ({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: FontFamilyCssVar;
}) =>
  Select({
    label,
    options: [
      fontFamilyOption('heading'),
      fontFamilyOption('body'),
      fontFamilyOption('accent'),
      futuraPtOption,
    ],
    defaultValue,
  });

FontFamily.Heading = fontFamilyCssVar('heading');
FontFamily.Body = fontFamilyCssVar('body');
FontFamily.Accent = fontFamilyCssVar('accent');
