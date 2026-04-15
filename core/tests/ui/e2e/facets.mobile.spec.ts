import { devices } from '@playwright/test';

import { expect, type Page, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test.use({ ...devices['iPhone 11'] });

const SHOP_ALL_URL = '/shop-all/';
const PRODUCT_LE_PARFAIT_JAR = '[Sample] 1 L Le Parfait Jar';

async function expandFilterIfNeededInDialog(page: Page, filterLabel: string) {
  const dialog = page.getByRole('dialog');
  const filterButton = dialog
    .getByRole('heading', { name: filterLabel, level: 3 })
    .getByRole('button', { name: filterLabel });

  const isExpanded = await filterButton.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    await filterButton.click();
  }
}

async function clickSpecificFilterOptionInDialog(
  page: Page,
  filterName: string,
  optionName: string,
) {
  const dialog = page.getByRole('dialog');

  await dialog
    .getByRole('region', { name: filterName })
    .getByRole('button', { name: optionName, disabled: false })
    .click();
}

test('mobile filter drawer shows apply action and closes when used', async ({ page }) => {
  const t = await getTranslations('Faceted');

  await page.goto(SHOP_ALL_URL);
  await expect(page.getByRole('heading', { name: 'Shop All 13' })).toBeVisible();

  await page.getByRole('button', { name: t('FacetedSearch.filters') }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const applyLabel = t('FacetedSearch.applyFilters');

  await expect(page.getByRole('dialog').getByRole('button', { name: applyLabel })).toBeVisible();

  await page.getByRole('dialog').getByRole('button', { name: applyLabel }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('mobile filter drawer: select color, apply filters, updates URL and list', async ({
  page,
}) => {
  const t = await getTranslations('Faceted');

  await page.goto(SHOP_ALL_URL);
  await expect(page.getByRole('heading', { name: 'Shop All 13' })).toBeVisible();

  await page.getByRole('button', { name: t('FacetedSearch.filters') }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await expandFilterIfNeededInDialog(page, 'Color');
  await clickSpecificFilterOptionInDialog(page, 'Color', 'Blue');

  await expect(page).toHaveURL((url) => url.searchParams.get('attr_Color') === 'Blue');

  await page
    .getByRole('dialog')
    .getByRole('button', { name: t('FacetedSearch.applyFilters') })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();

  await expect(page.getByRole('link', { name: PRODUCT_LE_PARFAIT_JAR })).toBeVisible();
});
