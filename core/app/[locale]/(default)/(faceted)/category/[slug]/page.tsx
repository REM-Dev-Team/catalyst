import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createLoader, SearchParams } from 'nuqs/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { getSessionCustomerAccessToken } from '~/auth';
import { FragmentOf } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { Slot } from '~/lib/makeswift/slot';

import { MAX_COMPARE_LIMIT } from '../../../compare/page-data';
import { getCompareProducts as fetchCompareProducts } from '../../fetch-compare-products';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { CategoryViewed } from './_components/category-viewed';
import { getCustomCategoryPage } from './_lib/get-custom-category-page';
import { getCategoryPageData } from './page-data';

const getCachedCategory = cache((categoryId: number) => {
  return {
    category: categoryId,
  };
});

const compareLoader = createCompareLoader();

const createCategorySearchParamsLoader = cache(
  async (categoryId: number, customerAccessToken?: string) => {
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

    return createLoader(filterParsers);
  },
);

export interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const categoryId = Number(slug);

  const { category } = await getCategoryPageData(categoryId, customerAccessToken);

  if (!category) {
    return notFound();
  }

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function Category(props: Props) {
  const { slug, locale } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  setRequestLocale(locale);

  const t = await getTranslations('Faceted');

  const categoryId = Number(slug);

  const { category, settings, categoryTree } = await getCategoryPageData(
    categoryId,
    customerAccessToken,
  );

  if (!category) {
    return notFound();
  }

  // Check for custom category page
  // Get path from category tree (first item is the root category)
  const categoryPath = categoryTree[0]?.path ?? undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const customPage = await getCustomCategoryPage(categoryId, categoryPath);

  if (customPage) {
    const CustomPageComponent = customPage;
    return <CustomPageComponent {...props} />;
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
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

    const search = await fetchFacetedSearch(
      {
        ...searchParams,
        ...parsedSearchParams,
        category: categoryId,
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
      <Slot
        label={`${category.name} top content`}
        snapshotId={`category-${categoryId}-top-content`}
      />
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
      <Slot
        label={`${category.name} bottom content`}
        snapshotId={`category-${categoryId}-bottom-content`}
      />
      <Stream value={streamableFacetedSearch}>
        {(search) => <CategoryViewed category={category} products={search.products.items} />}
      </Stream>
    </>
  );
}

// Helper functions for custom category pages
export async function getCategory(props: Props): Promise<NonNullable<Awaited<ReturnType<typeof getCategoryPageData>>['category']>> {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const categoryId = Number(slug);
  const { category } = await getCategoryPageData(categoryId, customerAccessToken);

  if (!category) {
    throw new Error(`Category not found: ${categoryId}`);
  }

  return category;
}

export async function getBreadcrumbs(props: Props): Promise<Array<{ label: string; href: string }>> {
  const category = await getCategory(props);

  return removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));
}

export async function getProducts(props: Props): Promise<Array<FragmentOf<typeof ProductCardFragment>>> {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const categoryId = Number(slug);

  const searchParams = await props.searchParams;
  const currencyCode = await getPreferredCurrencyCode();

  const loadSearchParams = await createCategorySearchParamsLoader(categoryId, customerAccessToken);
  const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

  const search = await fetchFacetedSearch(
    {
      ...searchParams,
      ...parsedSearchParams,
      category: categoryId,
    },
    currencyCode,
    customerAccessToken,
  );

  return search.products.items;
}

export async function getListProducts(props: Props): Promise<ReturnType<typeof productCardTransformer>> {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const categoryId = Number(slug);
  const { settings } = await getCategoryPageData(categoryId, customerAccessToken);

  const format = await getFormatter();

  const searchParams = await props.searchParams;
  const currencyCode = await getPreferredCurrencyCode();

  const loadSearchParams = await createCategorySearchParamsLoader(categoryId, customerAccessToken);
  const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

  const search = await fetchFacetedSearch(
    {
      ...searchParams,
      ...parsedSearchParams,
      category: categoryId,
    },
    currencyCode,
    customerAccessToken,
  );

  const products = search.products.items;

  const { defaultOutOfStockMessage, showOutOfStockMessage, showBackorderMessage } =
    settings?.inventory ?? {};

  return productCardTransformer(
    products,
    format,
    showOutOfStockMessage ? defaultOutOfStockMessage : undefined,
    showBackorderMessage,
  );
}

export async function getFilters(props: Props): Promise<Array<import('@/vibes/soul/sections/products-list-section/filters-panel').Filter>> {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const categoryId = Number(slug);
  const { categoryTree } = await getCategoryPageData(categoryId, customerAccessToken);

  const t = await getTranslations('Faceted');
  const searchParams = await props.searchParams;

  const loadSearchParams = await createCategorySearchParamsLoader(categoryId, customerAccessToken);
  const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};
  const cachedCategory = getCachedCategory(categoryId);
  const categorySearch = await fetchFacetedSearch(cachedCategory, undefined, customerAccessToken);

  const currencyCode = await getPreferredCurrencyCode();
  const refinedSearch = await fetchFacetedSearch(
    {
      ...searchParams,
      ...parsedSearchParams,
      category: categoryId,
    },
    currencyCode,
    customerAccessToken,
  );

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
}

export async function getPaginationInfo(props: Props): Promise<import('@/vibes/soul/primitives/cursor-pagination').CursorPaginationInfo> {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const categoryId = Number(slug);

  const searchParams = await props.searchParams;
  const currencyCode = await getPreferredCurrencyCode();

  const loadSearchParams = await createCategorySearchParamsLoader(categoryId, customerAccessToken);
  const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

  const search = await fetchFacetedSearch(
    {
      ...searchParams,
      ...parsedSearchParams,
      category: categoryId,
    },
    currencyCode,
    customerAccessToken,
  );

  return pageInfoTransformer(search.products.pageInfo);
}

export async function getTotalCount(props: Props): Promise<string> {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const categoryId = Number(slug);

  const format = await getFormatter();
  const searchParams = await props.searchParams;
  const currencyCode = await getPreferredCurrencyCode();

  const loadSearchParams = await createCategorySearchParamsLoader(categoryId, customerAccessToken);
  const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

  const search = await fetchFacetedSearch(
    {
      ...searchParams,
      ...parsedSearchParams,
      category: categoryId,
    },
    currencyCode,
    customerAccessToken,
  );

  return format.number(search.products.collectionInfo?.totalItems ?? 0);
}

export async function getTitle(props: Props): Promise<string> {
  const category = await getCategory(props);

  return category.name;
}

export async function getCompareProducts(props: Props): Promise<Array<{ id: string; title: string; image?: { src: string; alt: string }; href: string }>> {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const categoryId = Number(slug);
  const { settings } = await getCategoryPageData(categoryId, customerAccessToken);

  const productComparisonsEnabled =
    settings?.storefront.catalog?.productComparisonsEnabled ?? false;

  if (!productComparisonsEnabled) {
    return [];
  }

  const searchParams = await props.searchParams;
  const { compare } = compareLoader(searchParams);

  const compareIds = {
    entityIds: compare ? compare.map((id) => Number(id)) : [],
  };

  const products = await fetchCompareProducts(compareIds, customerAccessToken);

  return products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    href: product.path,
  }));
}

export function getCompareLabel(): string {
  return 'Compare';
}

export function getEmptyStateTitle(): string {
  return 'No products found';
}

export function getEmptyStateSubtitle(): string {
  return 'Try adjusting your filters to see more results.';
}

export async function getFilterLabel(): Promise<string> {
  const t = await getTranslations('Faceted');

  return t('FacetedSearch.filters');
}

export async function getFiltersPanelTitle(): Promise<string> {
  const t = await getTranslations('Faceted');

  return t('FacetedSearch.filters');
}

export function getMaxCompareLimitMessage(): string {
  return 'Maximum compare limit reached';
}

export function getRangeFilterApplyLabel(): string {
  return 'Apply';
}

export function getRemoveLabel(): string {
  return 'Remove';
}

export function getResetFiltersLabel(): string {
  return 'Reset filters';
}

export async function getSortLabel(): Promise<string> {
  const t = await getTranslations('Faceted');

  return t('SortBy.sortBy');
}

export async function getSortOptions(): Promise<Array<{ value: string; label: string }>> {
  const t = await getTranslations('Faceted');

  return [
    { value: 'featured', label: t('SortBy.featuredItems') },
    { value: 'newest', label: t('SortBy.newestItems') },
    { value: 'best_selling', label: t('SortBy.bestSellingItems') },
    { value: 'a_to_z', label: t('SortBy.aToZ') },
    { value: 'z_to_a', label: t('SortBy.zToA') },
    { value: 'best_reviewed', label: t('SortBy.byReview') },
    { value: 'lowest_price', label: t('SortBy.priceAscending') },
    { value: 'highest_price', label: t('SortBy.priceDescending') },
    { value: 'relevance', label: t('SortBy.relevance') },
  ];
}
