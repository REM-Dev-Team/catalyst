/**
 * Re-export all helper functions and types from the category page
 * This file helps TypeScript language server recognize the exports
 */

export type { Props } from '../page';

export {
  getBreadcrumbs,
  getCategory,
  getCompareLabel,
  getCompareProducts,
  getEmptyStateSubtitle,
  getEmptyStateTitle,
  getFilterLabel,
  getFilters,
  getFiltersPanelTitle,
  getListProducts,
  getMaxCompareLimitMessage,
  getPaginationInfo,
  getProducts,
  getRangeFilterApplyLabel,
  getRemoveLabel,
  getResetFiltersLabel,
  getSortLabel,
  getSortOptions,
  getTitle,
  getTotalCount,
} from '../page';

