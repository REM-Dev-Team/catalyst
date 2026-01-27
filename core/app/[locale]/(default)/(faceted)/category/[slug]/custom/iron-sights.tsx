/**
 * Custom category page for "Iron Sights" category.
 * This page uses the same format as the default category page with a custom hero banner.
 */

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { createLoader } from 'nuqs/server';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { getSessionCustomerAccessToken } from '~/auth';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { Image } from '~/components/image';
import { imageManagerImageUrl } from '~/lib/store-assets';

import { MAX_COMPARE_LIMIT } from '../../../../compare/page-data';
import { getCompareProducts as fetchCompareProducts } from '../../../fetch-compare-products';
import { fetchFacetedSearch } from '../../../fetch-faceted-search';
import { CategoryViewed } from '../_components/category-viewed';
import { getCategoryPageData } from '../page-data';
import { getCategoryIdByPath } from '../_lib/get-category-id-by-path';
import type { Props } from '../_lib/category-page-helpers';

const compareLoader = createCompareLoader();

const getCachedCategory = cache((categoryId: number) => {
  return {
    category: categoryId,
  };
});

const createCategorySearchParamsLoader = cache(
  async (categoryId: number, customerAccessToken?: string) => {
    try {
      const cachedCategory = getCachedCategory(categoryId);
      const categorySearch = await fetchFacetedSearch(cachedCategory, undefined, customerAccessToken);
      const categoryFacets = categorySearch.facets.items.filter(
        (facet) => facet.__typename !== 'CategorySearchFilter',
      );
      const transformedCategoryFacets = await facetsTransformer({
        refinedFacets: categoryFacets,
        allFacets: categoryFacets,
        searchParams: {},
      });
      const categoryFilters = transformedCategoryFacets.filter((facet) => facet != null);
      const filterParsers = getFilterParsers(categoryFilters);

      // If there are no filters, return `null`, since calling `createLoader` with an empty
      // object will throw the following cryptic error:
      //
      // ```
      // Error: [nuqs] Empty search params cache. Search params can't be accessed in Layouts.
      //   See https://err.47ng.com/NUQS-500
      // ```
      if (Object.keys(filterParsers).length === 0) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return createLoader(filterParsers);
    } catch {
      // If fetching category search fails, return null to allow the page to still work
      return null;
    }
  },
);

export default async function IronSightsCategoryPage(props: Props) {
  const { slug, locale } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  setRequestLocale(locale);

  const t = await getTranslations('Faceted');

  // Try to resolve category ID from slug (handles both numeric IDs and path strings)
  let categoryId = Number(slug);
  if (Number.isNaN(categoryId)) {
    // If slug is not a number, try to resolve it from the path
    // Ensure path starts with / and ends with /
    let normalizedPath = slug.startsWith('/') ? slug : `/${slug}`;
    if (!normalizedPath.endsWith('/')) {
      normalizedPath = `${normalizedPath}/`;
    }
    const resolvedCategoryId = await getCategoryIdByPath(normalizedPath);
    if (!resolvedCategoryId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return notFound();
    }
    categoryId = resolvedCategoryId;
  }

  const { category, settings, categoryTree } = await getCategoryPageData(
    categoryId,
    customerAccessToken,
  );

  if (!category) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return notFound();
  }

  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));

  const showRating = Boolean(settings?.reviews.enabled && settings.display.showProductRating);

  const productComparisonsEnabled =
    settings?.storefront.catalog?.productComparisonsEnabled ?? false;

  const streamableFacetedSearch = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const currencyCode = await getPreferredCurrencyCode();

    const loadSearchParams = await createCategorySearchParamsLoader(
      categoryId,
      customerAccessToken,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-condition
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

    // Ensure categoryId is a number
    const numericCategoryId = Number(categoryId);
    if (Number.isNaN(numericCategoryId)) {
      throw new Error(`Invalid category ID: ${categoryId}`);
    }

    // Filter out invalid parameters (e.g., slug from Next.js bug)
    // https://github.com/vercel/next.js/issues/51802
    const { slug: _slug, ...validSearchParams } = searchParams;
    const { slug: _parsedSlug, ...validParsedParams } = parsedSearchParams;

    const search = await fetchFacetedSearch(
      {
        ...validSearchParams,
        ...validParsedParams,
        category: numericCategoryId,
      },
      currencyCode,
      customerAccessToken,
    );

    return search;
  });

  const streamableProducts = Streamable.from(async () => {
    const format = await getFormatter();

    const search = await streamableFacetedSearch;
    const products = search.products.items;

    const { defaultOutOfStockMessage, showOutOfStockMessage, showBackorderMessage } =
      settings?.inventory ?? {};

    return productCardTransformer(
      products,
      format,
      showOutOfStockMessage ? defaultOutOfStockMessage : undefined,
      showBackorderMessage,
    );
  });

  const streamableTotalCount = Streamable.from(async () => {
    const format = await getFormatter();
    const search = await streamableFacetedSearch;

    return format.number(search.products.collectionInfo?.totalItems ?? 0);
  });

  const streamablePagination = Streamable.from(async () => {
    const search = await streamableFacetedSearch;

    return pageInfoTransformer(search.products.pageInfo);
  });

  const streamableFilters = Streamable.from(async () => {
    const searchParams = await props.searchParams;

    const loadSearchParams = await createCategorySearchParamsLoader(
      categoryId,
      customerAccessToken,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-condition
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};
    const cachedCategory = getCachedCategory(categoryId);
    const categorySearch = await fetchFacetedSearch(cachedCategory, undefined, customerAccessToken);
    const refinedSearch = await streamableFacetedSearch;

    const allFacets = categorySearch.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );
    const refinedFacets = refinedSearch.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );

    const transformedFacets = await facetsTransformer({
      refinedFacets,
      allFacets,
      searchParams: { ...searchParams, ...parsedSearchParams },
    });

    const filters = transformedFacets.filter((facet) => facet != null);

    const tree = categoryTree[0];
    const subCategoriesFilters =
      tree == null || tree.children.length === 0
        ? []
        : [
            {
              type: 'link-group' as const,
              label: t('Category.subCategories'),
              links: tree.children.map((child) => ({
                label: child.name,
                href: child.path,
              })),
            },
          ];

    return [...subCategoriesFilters, ...filters];
  });

  const streamableCompareProducts = Streamable.from(async () => {
    const searchParams = await props.searchParams;

    if (!productComparisonsEnabled) {
      return [];
    }

    const { compare } = compareLoader(searchParams);

    const compareIds = { entityIds: compare ? compare.map((id: string) => Number(id)) : [] };

    const products = await fetchCompareProducts(compareIds, customerAccessToken);

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      href: product.path,
    }));
  });

  return (
    <>
      {/* Hero/Banner Section */}
      <section className="relative w-full">
        <div className="relative h-[400px] w-full overflow-hidden @xl:h-[500px] @2xl:h-[600px]">
          {/* Background Images - Different for mobile and desktop */}
          <Image
            alt={category.name}
            className="object-cover @xl:hidden"
            fill
            priority
            sizes="100vw"
            src={imageManagerImageUrl('iron-sights-mobile.jpeg')}
          />
          <Image
            alt={category.name}
            className="hidden object-cover @xl:block"
            fill
            priority
            sizes="(max-width: 1536px) 100vw, 1536px"
            src={imageManagerImageUrl('iron-sights-desktop.jpeg')}
          />
        </div>
      </section>

      <ProductsListSection
        aspectRatio="4:3"
        breadcrumbs={breadcrumbs}
        compareLabel={t('Compare.compare')}
        compareProducts={streamableCompareProducts}
        emptyStateSubtitle={t('Category.Empty.subtitle')}
        emptyStateTitle={t('Category.Empty.title')}
        filterLabel={t('FacetedSearch.filters')}
        filters={streamableFilters}
        filtersPanelTitle={t('FacetedSearch.filters')}
        maxCompareLimitMessage={t('Compare.maxCompareLimit')}
        maxItems={MAX_COMPARE_LIMIT}
        paginationInfo={streamablePagination}
        products={streamableProducts}
        rangeFilterApplyLabel={t('FacetedSearch.Range.apply')}
        removeLabel={t('Compare.remove')}
        resetFiltersLabel={t('FacetedSearch.resetFilters')}
        showCompare={false}
        showRating={showRating}
        sortDefaultValue="featured"
        sortLabel={t('SortBy.sortBy')}
        sortOptions={[
          { value: 'featured', label: t('SortBy.featuredItems') },
          { value: 'newest', label: t('SortBy.newestItems') },
          { value: 'best_selling', label: t('SortBy.bestSellingItems') },
          { value: 'a_to_z', label: t('SortBy.aToZ') },
          { value: 'z_to_a', label: t('SortBy.zToA') },
          { value: 'best_reviewed', label: t('SortBy.byReview') },
          { value: 'lowest_price', label: t('SortBy.priceAscending') },
          { value: 'highest_price', label: t('SortBy.priceDescending') },
          { value: 'relevance', label: t('SortBy.relevance') },
        ]}
        sortParamName="sort"
        title={category.name}
        totalCount={streamableTotalCount}
      />
      <Stream
        value={Streamable.all([
          Streamable.from(async () => Promise.resolve(category)),
          Streamable.from(async () => {
            const search = await streamableFacetedSearch;
            return search.products.items;
          }),
        ])}
      >
        {(result) => {
          const [categoryData, products] = result;
          return <CategoryViewed category={categoryData} products={products} />;
        }}
      </Stream>
    </>
  );
}
