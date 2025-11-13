import { cache } from 'react';
import type { ComponentType } from 'react';

import type { Props } from '../page';
import { getCategoryIdByPath } from './get-category-id-by-path';
import IronSightsPage from '../custom/iron-sights';

/**
 * Registry of custom category pages by category ID.
 * To create a custom page for a category, import and register it here.
 *
 * Example:
 * ```tsx
 * import CustomCategory123 from '../custom/123';
 *
 * export const customCategoryPages: Record<number, ComponentType<Props>> = {
 *   123: CustomCategory123,
 * };
 * ```
 */
export const customCategoryPages: Record<number, ComponentType<Props>> = {};

/**
 * Registry of custom category pages by path.
 * Use this when you know the category path but not the ID.
 * The system will look up the category ID from the path.
 *
 * Example:
 * ```tsx
 * import IronSightsPage from '../custom/iron-sights';
 *
 * export const customCategoryPagesByPath: Record<string, ComponentType<Props>> = {
 *   '/iron-sights/': IronSightsPage,
 * };
 * ```
 */
export const customCategoryPagesByPath: Record<string, ComponentType<Props>> = {
  '/iron-sights/': IronSightsPage,
};

/**
 * Gets a custom category page component if one exists for the given category ID.
 * Also checks path-based registry if category ID lookup fails.
 *
 * @param categoryId - The category entity ID
 * @param categoryPath - Optional category path for path-based lookup
 * @returns The custom page component if found, null otherwise
 */
export const getCustomCategoryPage = cache(
  async (
    categoryId: number,
    categoryPath?: string,
  ): Promise<ComponentType<Props> | null> => {
    // First, try direct ID lookup
    if (customCategoryPages[categoryId]) {
      return customCategoryPages[categoryId];
    }

    // If path is provided, try path-based lookup
    if (categoryPath) {
      // Normalize the path (ensure it starts with / and ends with /)
      const normalizedPath = categoryPath.startsWith('/')
        ? categoryPath.endsWith('/')
          ? categoryPath
          : `${categoryPath}/`
        : `/${categoryPath}${categoryPath.endsWith('/') ? '' : '/'}`;

      // Try exact match first
      const pathPage = customCategoryPagesByPath[normalizedPath] || customCategoryPagesByPath[categoryPath];
      if (pathPage) {
        return pathPage;
      }

      // Try to find the category ID from path and check if it matches
      const pathCategoryId = await getCategoryIdByPath(normalizedPath);
      if (pathCategoryId === categoryId && customCategoryPages[pathCategoryId]) {
        return customCategoryPages[pathCategoryId];
      }
    }

    return null;
  },
);

