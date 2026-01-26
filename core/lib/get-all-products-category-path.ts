import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { GetLinksAndSectionsQuery } from '~/app/[locale]/(default)/page-data';

import { FooterSectionsFragment } from '~/components/footer/fragment';

/**
 * Gets the path to the "all-products" category page.
 * Falls back to '/shop-all' if the category is not found.
 *
 * @returns The category path or '/shop-all' as fallback
 */
export const getAllProductsCategoryPath = cache(async (): Promise<string> => {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();
    const { data: response } = await client.fetch({
      document: GetLinksAndSectionsQuery,
      customerAccessToken,
      variables: { currencyCode },
      validateCustomerAccessToken: false,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const site = readFragment(FooterSectionsFragment, response).site;

    // Find the "all-products" category
    const allProductsCategory = site.categoryTree.find((category) => {
      const nameLower = category.name.toLowerCase();

      return (
        (nameLower === 'all-products' ||
          nameLower === 'all products' ||
          nameLower.includes('all-product') ||
          (nameLower.includes('all') && nameLower.includes('product'))) &&
        category.children.length > 0
      );
    });

    // Return the category path if found, otherwise fallback to shop-all
    return allProductsCategory?.path ?? '/shop-all';
  } catch {
    // Fallback to shop-all if anything goes wrong
    return '/shop-all';
  }
});
