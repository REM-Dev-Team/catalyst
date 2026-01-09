import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache } from 'nuqs/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Product } from '@/vibes/soul/primitives/product-card';
import { Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { Filter } from '@/vibes/soul/sections/products-list-section/filters-panel';
import { Option as SortOption } from '@/vibes/soul/sections/products-list-section/sorting';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { MAX_COMPARE_LIMIT } from '../../compare/page-data';
import { getCompareProducts as getCompareProductsData } from '../fetch-compare-products';
import { fetchFacetedSearch } from '../fetch-faceted-search';

import { getShopAllPageData } from './page-data';

const createShopAllSearchParamsCache = cache(async (props: Props) => {
  await props.searchParams; // Ensure searchParams is awaited for cache key
  const allProductsSearch = await fetchFacetedSearch({});
  const allFacets = allProductsSearch.facets.items;
  const transformedFacets = await facetsTransformer({
    refinedFacets: allFacets,
    allFacets,
    searchParams: {},
  });
  const filters = transformedFacets.filter((facet) => facet != null);
  const filterParsers = getFilterParsers(filters);

  // If there are no filters, return `null`, since calling `createSearchParamsCache` with an empty
  // object will throw the following cryptic error:
  //
  // ```
  // Error: [nuqs] Empty search params cache. Search params can't be accessed in Layouts.
  //   See https://err.47ng.com/NUQS-500
  // ```
  if (Object.keys(filterParsers).length === 0) {
    return null;
  }

  return createSearchParamsCache(filterParsers);
});

const getRefinedSearch = cache(async (props: Props) => {
  const searchParams = await props.searchParams;
  const searchParamsCache = await createShopAllSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};

  return await fetchFacetedSearch({
    ...searchParams,
    ...parsedSearchParams,
  });
});

async function getBreadcrumbs(locale: string): Promise<Breadcrumb[]> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return [
    { label: t('Search.Breadcrumbs.home'), href: '/' },
    { label: 'Shop All', href: '/shop-all' },
  ];
}

function getTitle(): string | null {
  return 'Shop All';
}

const getSearch = cache(async (props: Props) => {
  const search = await getRefinedSearch(props);

  return search;
});

async function getTotalCount(props: Props): Promise<string> {
  const format = await getFormatter();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const search = await getSearch(props);

  return format.number(search.products.collectionInfo?.totalItems ?? 0);
}

async function getProducts(props: Props) {
  const search = await getSearch(props);

  return search.products.items;
}

async function getListProducts(props: Props): Promise<Product[]> {
  const products = await getProducts(props);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const format = await getFormatter();

  return products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name ?? undefined,
  }));
}

async function getFilters(props: Props): Promise<Filter[]> {
  const searchParams = await props.searchParams;
  const searchParamsCache = await createShopAllSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};
  const allProductsSearch = await fetchFacetedSearch({});
  const refinedSearch = await getRefinedSearch(props);

  const allFacets = allProductsSearch.facets.items;
  const refinedFacets = refinedSearch.facets.items;

  const transformedFacets = await facetsTransformer({
    refinedFacets,
    allFacets,
    searchParams: { ...searchParams, ...parsedSearchParams },
  });

  return transformedFacets.filter((facet) => facet != null);
}

async function getSortLabel(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return t('SortBy.sortBy');
}

async function getSortOptions(locale: string): Promise<SortOption[]> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

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

async function getPaginationInfo(props: Props): Promise<CursorPaginationInfo> {
  const search = await getSearch(props);

  return pageInfoTransformer(search.products.pageInfo);
}

async function getShowCompare() {
  const data = await getShopAllPageData();

  return data.settings?.storefront.catalog?.productComparisonsEnabled ?? false;
}

const cachedCompareProductIds = cache(async (props: Props) => {
  const searchParams = await props.searchParams;

  const compareLoader = createCompareLoader();

  const { compare } = compareLoader(searchParams);

  return { entityIds: compare ? compare.map((id: string) => Number(id)) : [] };
});

async function getCompareProducts(props: Props) {
  const compareIds = await cachedCompareProductIds(props);

  const products = await getCompareProductsData(compareIds);

  return products.map((product) => ({
    id: product.entityId.toString(),
    title: product.name,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    href: product.path,
  }));
}

async function getFilterLabel(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return t('FacetedSearch.filters');
}

async function getCompareLabel(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return t('Compare.compare');
}

async function getRemoveLabel(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return t('Compare.remove');
}

async function getMaxCompareLimitMessage(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return t('Compare.maxCompareLimit');
}

async function getFiltersPanelTitle(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return t('FacetedSearch.filters');
}

async function getRangeFilterApplyLabel(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return t('FacetedSearch.Range.apply');
}

async function getResetFiltersLabel(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted' });

  return t('FacetedSearch.resetFilters');
}

async function getEmptyStateTitle(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted.Search' });

  return t('Empty.title', { term: '' });
}

async function getEmptyStateSubtitle(locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'Faceted.Search' });

  return t('Empty.subtitle');
}

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function generateMetadata(): Metadata {
  return {
    title: 'Shop All',
  };
}

export default async function ShopAll(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  return (
    <ProductsListSection
      breadcrumbs={Streamable.from(() => getBreadcrumbs(locale))}
      compareLabel={Streamable.from(() => getCompareLabel(locale))}
      compareProducts={Streamable.from(() => getCompareProducts(props))}
      emptyStateSubtitle={Streamable.from(() => getEmptyStateSubtitle(locale))}
      emptyStateTitle={Streamable.from(() => getEmptyStateTitle(locale))}
      filterLabel={await getFilterLabel(locale)}
      filters={Streamable.from(() => getFilters(props))}
      filtersPanelTitle={Streamable.from(() => getFiltersPanelTitle(locale))}
      maxCompareLimitMessage={Streamable.from(() => getMaxCompareLimitMessage(locale))}
      maxItems={MAX_COMPARE_LIMIT}
      paginationInfo={Streamable.from(() => getPaginationInfo(props))}
      products={Streamable.from(() => getListProducts(props))}
      rangeFilterApplyLabel={Streamable.from(() => getRangeFilterApplyLabel(locale))}
      removeLabel={Streamable.from(() => getRemoveLabel(locale))}
      resetFiltersLabel={Streamable.from(() => getResetFiltersLabel(locale))}
      showCompare={Streamable.from(getShowCompare)}
      sortDefaultValue="featured"
      sortLabel={Streamable.from(() => getSortLabel(locale))}
      sortOptions={Streamable.from(() => getSortOptions(locale))}
      sortParamName="sort"
      title={Streamable.from(() => Promise.resolve(getTitle()))}
      totalCount={Streamable.from(() => getTotalCount(props))}
    />
  );
}
