import { Sliders } from 'lucide-react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Product } from '@/vibes/soul/primitives/product-card';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/vibes/soul/sections/breadcrumbs';
import { ProductList } from '@/vibes/soul/sections/product-list';
import { Filter, FiltersPanel } from '@/vibes/soul/sections/products-list-section/filters-panel';
import {
  Sorting,
  SortingSkeleton,
  Option as SortOption,
} from '@/vibes/soul/sections/products-list-section/sorting';

interface Props {
  breadcrumbs?: Streamable<Breadcrumb[]>;
  title?: Streamable<string | null>;
  totalCount: Streamable<number>;
  products: Streamable<Product[]>;
  filters: Streamable<Filter[]>;
  sortOptions: Streamable<SortOption[]>;
  compareProducts?: Streamable<Product[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  compareHref?: string;
  compareLabel?: Streamable<string>;
  showCompare?: Streamable<boolean>;
  filterLabel?: string;
  filtersPanelTitle?: Streamable<string>;
  resetFiltersLabel?: Streamable<string>;
  rangeFilterApplyLabel?: Streamable<string>;
  sortLabel?: Streamable<string | null>;
  sortPlaceholder?: Streamable<string | null>;
  sortParamName?: string;
  sortDefaultValue?: string;
  compareParamName?: string;
  emptyStateSubtitle?: Streamable<string>;
  emptyStateTitle?: Streamable<string>;
  placeholderCount?: number;
  removeLabel?: Streamable<string>;
  maxItems?: number;
  maxCompareLimitMessage?: Streamable<string>;
  aspectRatio?: '5:6' | '3:4' | '1:1' | '4:3';
  mobileLayout?: 'portrait' | 'landscape';
}

export function ProductsListSection({
  breadcrumbs: streamableBreadcrumbs,
  title = 'Products',
  totalCount,
  products,
  compareProducts,
  sortOptions: streamableSortOptions,
  sortDefaultValue,
  filters,
  compareHref,
  compareLabel,
  showCompare,
  paginationInfo,
  filterLabel = 'Filters',
  filtersPanelTitle: streamableFiltersPanelTitle = 'Filters',
  resetFiltersLabel,
  rangeFilterApplyLabel,
  sortLabel: streamableSortLabel,
  sortPlaceholder: streamableSortPlaceholder,
  sortParamName,
  compareParamName,
  emptyStateSubtitle,
  emptyStateTitle,
  placeholderCount = 8,
  removeLabel,
  maxItems,
  maxCompareLimitMessage,
  aspectRatio = '4:3',
  mobileLayout = 'portrait',
}: Props) {
  return (
    <div className="group/products-list-section @container">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
        <Stream fallback={<BreadcrumbsSkeleton />} value={streamableBreadcrumbs}>
          {(breadcrumbs) =>
            breadcrumbs && breadcrumbs.length > 1 && <Breadcrumbs breadcrumbs={breadcrumbs} />
          }
        </Stream>
        <div className="flex items-stretch gap-8 @4xl:gap-10">
          <aside className="hidden w-52 @3xl:block @4xl:w-60">
            <Stream value={streamableFiltersPanelTitle}>
              {(filtersPanelTitle) => <h2 className="sr-only">{filtersPanelTitle}</h2>}
            </Stream>
            <FiltersPanel
              className="sticky top-4"
              filters={filters}
              paginationInfo={paginationInfo}
              rangeFilterApplyLabel={rangeFilterApplyLabel}
              resetFiltersLabel={resetFiltersLabel}
            />
          </aside>

          <div className="flex-1 group-has-[[data-pending]]/products-list-section:animate-pulse">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 text-foreground">
              <h1 className="flex items-center gap-2 font-heading text-3xl font-medium leading-none uppercase @lg:text-4xl @2xl:text-5xl">
                <Stream
                  fallback={
                    <span className="inline-flex h-[1lh] w-[6ch] animate-pulse rounded-lg bg-contrast-100" />
                  }
                  value={title}
                >
                  {(titleValue) => titleValue}
                </Stream>
              </h1>
              <div className="flex gap-2">
                <Stream
                  fallback={<SortingSkeleton />}
                  value={Streamable.all([
                    streamableSortLabel,
                    streamableSortOptions,
                    streamableSortPlaceholder,
                  ])}
                >
                  {([label, options, placeholder]) => (
                    <Sorting
                      defaultValue={sortDefaultValue}
                      label={label}
                      options={options}
                      paramName={sortParamName}
                      placeholder={placeholder}
                    />
                  )}
                </Stream>
                <div className="block @3xl:hidden">
                  <SidePanel.Root>
                    <SidePanel.Trigger asChild>
                      <Button size="medium" variant="secondary">
                        {filterLabel}
                        <span className="hidden @xl:block">
                          <Sliders size={20} />
                        </span>
                      </Button>
                    </SidePanel.Trigger>
                    <Stream value={streamableFiltersPanelTitle}>
                      {(filtersPanelTitle) => (
                        <SidePanel.Content title={filtersPanelTitle}>
                          <FiltersPanel
                            filters={filters}
                            paginationInfo={paginationInfo}
                            rangeFilterApplyLabel={rangeFilterApplyLabel}
                            resetFiltersLabel={resetFiltersLabel}
                          />
                        </SidePanel.Content>
                      )}
                    </Stream>
                  </SidePanel.Root>
                </div>
              </div>
            </div>
            <ProductList
              aspectRatio={aspectRatio as '5:6' | '3:4' | '1:1' | '4:3'}
              compareHref={compareHref}
              compareLabel={compareLabel}
              compareParamName={compareParamName}
              compareProducts={compareProducts}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              maxCompareLimitMessage={maxCompareLimitMessage}
              maxItems={maxItems}
              mobileLayout={mobileLayout}
              placeholderCount={placeholderCount}
              products={products}
              removeLabel={removeLabel}
              showCompare={showCompare}
            />

            <Stream fallback={null} value={paginationInfo}>
              {(resolvedPaginationInfo) =>
                resolvedPaginationInfo ? <CursorPagination info={resolvedPaginationInfo} /> : null
              }
            </Stream>
          </div>
        </div>
      </div>
    </div>
  );
}
