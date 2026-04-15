import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod/v4';

import { defaultLocale, locales } from '~/i18n/locales';

dotenvConfig({ path: ['.env', '.env.local', '.env.test'], override: true });

const localeSchema = z.string().refine((val: string) => locales.includes(val), {
  error: `TESTS_LOCALE must be one of: ${locales.join(', ')}`,
});

// Match `createEnv` + `emptyStringAsUndefined` from `@t3-oss/env-core` (ESM-only; breaks Playwright’s CJS load).
function runtimeEnv(): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(process.env).map(([key, value]) => [key, value === '' ? undefined : value]),
  );
}

const envSchema = z.object({
  BIGCOMMERCE_ADMIN_API_HOST: z.string().optional().default('api.bigcommerce.com'),
  BIGCOMMERCE_ACCESS_TOKEN: z.string().optional(),
  BIGCOMMERCE_ACCESS_TOKEN_CLIENT_ID: z.string().optional(),
  BIGCOMMERCE_ACCESS_TOKEN_CLIENT_SECRET: z.string().optional(),
  BIGCOMMERCE_CHANNEL_ID: z.coerce.number().optional(),
  BIGCOMMERCE_STORE_HASH: z.string().optional(),
  PLAYWRIGHT_TEST_BASE_URL: z.string().optional().default('http://localhost:3000'),
  VERCEL_PROTECTION_BYPASS: z.string().optional().default(''),
  CI: z.stringbool().optional().default(false),
  TESTS_READ_ONLY: z.stringbool().optional().default(false),
  TESTS_LOCALE: localeSchema.optional().default(defaultLocale),
  TESTS_FALLBACK_LOCALE: localeSchema.optional().default(defaultLocale),
  TEST_CUSTOMER_ID: z.coerce.number().optional(),
  TEST_CUSTOMER_EMAIL: z.string().optional(),
  TEST_CUSTOMER_PASSWORD: z.string().optional(),
  DEFAULT_PRODUCT_ID: z.coerce.number().optional(),
  DEFAULT_COMPLEX_PRODUCT_ID: z.coerce.number().optional(),
  TRAILING_SLASH: z.stringbool().optional().default(true),
});

export const testEnv = envSchema.parse(runtimeEnv());
