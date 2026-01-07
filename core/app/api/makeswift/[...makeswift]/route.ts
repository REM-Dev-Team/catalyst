import { type Font, MakeswiftApiHandler } from '@makeswift/runtime/next/server';
import { strict } from 'assert';

import { runtime } from '~/lib/makeswift/runtime';

import '~/lib/makeswift/components';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

const defaultVariants: Font['variants'] = [
  {
    weight: '300',
    style: 'normal',
  },
  {
    weight: '400',
    style: 'normal',
  },
  {
    weight: '500',
    style: 'normal',
  },
];

const handler = MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.NEXT_PUBLIC_MAKESWIFT_API_ORIGIN ?? process.env.MAKESWIFT_API_ORIGIN,
  appOrigin: process.env.NEXT_PUBLIC_MAKESWIFT_APP_ORIGIN ?? process.env.MAKESWIFT_APP_ORIGIN,
  getFonts() {
    return [
      {
        family: 'var(--font-family-inter)',
        label: 'Inter',
        variants: defaultVariants,
      },
      {
        family: 'var(--font-family-dm-serif-text)',
        label: 'DM Serif Text',
        variants: [{ weight: '400', style: 'normal' }],
      },
      {
        family: 'var(--font-family-roboto-mono)',
        label: 'Roboto Mono',
        variants: defaultVariants,
      },
      {
        family: '"futura-pt", sans-serif',
        label: 'Futura PT (Adobe Fonts)',
        variants: [
          { weight: '300', style: 'normal' },
          { weight: '300', style: 'italic' },
          { weight: '400', style: 'normal' },
          { weight: '400', style: 'italic' },
          { weight: '500', style: 'normal' },
          { weight: '500', style: 'italic' },
          { weight: '600', style: 'normal' },
          { weight: '600', style: 'italic' },
          { weight: '700', style: 'normal' },
          { weight: '700', style: 'italic' },
          { weight: '800', style: 'normal' },
          { weight: '800', style: 'italic' },
        ],
      },
    ];
  },
});

export { handler as GET, handler as POST };
