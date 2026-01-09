import { Makeswift } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { strict } from 'assert';
import { getLocale } from 'next-intl/server';

import { defaultLocale } from '~/i18n/locales';

import { runtime } from './runtime';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

export const client = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.NEXT_PUBLIC_MAKESWIFT_API_ORIGIN ?? process.env.MAKESWIFT_API_ORIGIN,
});

function isErrorWithStatus(error: unknown): error is Error & { status: number } {
  if (!(error instanceof Error)) {
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(error, 'status')) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions
  const status = (error as unknown as { status: unknown }).status;
  return typeof status === 'number';
}

export const getPageSnapshot = async ({ path, locale }: { path: string; locale: string }) => {
  // Exclude webpack hot-update files and other Next.js internal files
  if (
    path.includes('webpack') ||
    path.includes('_next') ||
    path.includes('__webpack') ||
    path.startsWith('/static/')
  ) {
    return null;
  }

  try {
    return await client.getPageSnapshot(path, {
      siteVersion: await getSiteVersion(),
      locale: normalizeLocale(locale),
    });
  } catch (error) {
    // Handle 400 Bad Request and other errors gracefully
    if (isErrorWithStatus(error) && error.status === 400) {
      return null;
    }
    throw error;
  }
};

export const getComponentSnapshot = async (snapshotId: string) => {
  const locale = await getLocale();

  return await client.getComponentSnapshot(snapshotId, {
    siteVersion: await getSiteVersion(),
    locale: normalizeLocale(locale),
  });
};

function normalizeLocale(locale: string): string | undefined {
  return locale === defaultLocale ? undefined : locale;
}
