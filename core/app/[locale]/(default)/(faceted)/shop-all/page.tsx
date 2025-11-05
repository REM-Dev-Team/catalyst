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
  const searchParams = await props.searchParams;
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

async function getBreadcrumbs(): Promise<Breadcrumb[]> {
  const t = await getTranslations('ShopAll');

  return [
    { label: t('Breadcrumbs.home'), href: '/' },
    { label: t('Breadcrumbs.shopAll'), href: '/shop-all' },
  ];
}

async function getTitle(): Promise<string> {
  const t = await getTranslations('ShopAll');

  return t('title');
}

const getSearch = cache(async (props: Props) => {
  const search = await getRefinedSearch(props);

  return search;
});

async function getTotalCount(props: Props): Promise<number> {
  const search = await getSearch(props);

  return search.products.collectionInfo?.totalItems ?? 0;
}

async function getProducts(props: Props) {
  const search = await getSearch(props);

  return search.products.items;
}

async function getListProducts(props: Props): Promise<Product[]> {
  const products = await getProducts(props);
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

async function getSortLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.SortBy');

  return t('ariaLabel');
}

async function getSortOptions(): Promise<SortOption[]> {
  const t = await getTranslations('FacetedGroup.SortBy');

  return [
    { value: 'featured', label: t('featuredItems') },
    { value: 'newest', label: t('newestItems') },
    { value: 'best_selling', label: t('bestSellingItems') },
    { value: 'a_to_z', label: t('aToZ') },
    { value: 'z_to_a', label: t('zToA') },
    { value: 'best_reviewed', label: t('byReview') },
    { value: 'lowest_price', label: t('priceAscending') },
    { value: 'highest_price', label: t('priceDescending') },
    { value: 'relevance', label: t('relevance') },
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

async function getFilterLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getCompareLabel(): Promise<string> {
  const t = await getTranslations('Components.ProductCard.Compare');

  return t('compare');
}

async function getRemoveLabel(): Promise<string> {
  const t = await getTranslations('Components.ProductCard.Compare');

  return t('remove');
}

async function getMaxCompareLimitMessage(): Promise<string> {
  const t = await getTranslations('Components.ProductCard.Compare');

  return t('maxCompareLimit');
}

async function getFiltersPanelTitle(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getRangeFilterApplyLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch.Range');

  return t('apply');
}

async function getResetFiltersLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('resetFilters');
}

async function getEmptyStateTitle(): Promise<string> {
  const t = await getTranslations('ShopAll');

  return t('emptyStateTitle');
}

async function getEmptyStateSubtitle(): Promise<string> {
  const t = await getTranslations('ShopAll');

  return t('emptyStateSubtitle');
}

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ShopAll');

  return {
    title: t('title'),
  };
}

export default async function ShopAll(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  return (
    <ProductsListSection
      breadcrumbs={Streamable.from(getBreadcrumbs)}
      compareLabel={Streamable.from(getCompareLabel)}
      compareProducts={Streamable.from(() => getCompareProducts(props))}
      emptyStateSubtitle={Streamable.from(getEmptyStateSubtitle)}
      emptyStateTitle={Streamable.from(getEmptyStateTitle)}
      filterLabel={await getFilterLabel()}
      filters={Streamable.from(() => getFilters(props))}
      filtersPanelTitle={Streamable.from(getFiltersPanelTitle)}
      maxCompareLimitMessage={Streamable.from(getMaxCompareLimitMessage)}
      maxItems={MAX_COMPARE_LIMIT}
      paginationInfo={Streamable.from(() => getPaginationInfo(props))}
      products={Streamable.from(() => getListProducts(props))}
      rangeFilterApplyLabel={Streamable.from(getRangeFilterApplyLabel)}
      removeLabel={Streamable.from(getRemoveLabel)}
      resetFiltersLabel={Streamable.from(getResetFiltersLabel)}
      showCompare={Streamable.from(getShowCompare)}
      sortDefaultValue="featured"
      sortLabel={Streamable.from(getSortLabel)}
      sortOptions={Streamable.from(getSortOptions)}
      sortParamName="sort"
      title={Streamable.from(getTitle)}
      totalCount={Streamable.from(() => getTotalCount(props))}
    />
  );
}

