import { cache, type ComponentType } from 'react';

import ChassisSystemsPage from '../custom/chassis-systems';
import IronSightsPage from '../custom/iron-sights';
import MuzzleDevicesPage from '../custom/muzzle-devices';
import ShootingSystemPage from '../custom/shooting-system';
import type { Props } from '../page';

import { getCategoryIdByPath } from './get-category-id-by-path';

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
  '/chassis-systems/': ChassisSystemsPage,
  '/muzzle-devices/': MuzzleDevicesPage,
  '/shooting-system/': ShootingSystemPage,
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
  async (categoryId: number, categoryPath?: string): Promise<ComponentType<Props> | null> => {
    // First, try direct ID lookup
    if (customCategoryPages[categoryId]) {
      return customCategoryPages[categoryId];
    }

    // If path is provided, try path-based lookup
    if (categoryPath) {
      // Normalize the path (ensure it starts with / and ends with /)
      let normalizedPath = categoryPath;

      // Remove locale prefix if present (e.g., "/en/shooting-system/" -> "/shooting-system/")
      normalizedPath = normalizedPath.replace(/^\/[a-z]{2}\//, '/');

      if (!normalizedPath.startsWith('/')) {
        normalizedPath = `/${normalizedPath}`;
      }

      if (!normalizedPath.endsWith('/')) {
        normalizedPath = `${normalizedPath}/`;
      }

      // Try exact match first
      const pathPage =
        customCategoryPagesByPath[normalizedPath] || customCategoryPagesByPath[categoryPath];

      if (pathPage) {
        return pathPage;
      }

      // Try matching without leading/trailing slashes or with partial matches
      const pathWithoutSlashes = normalizedPath.replace(/^\/|\/$/g, '');
      const matchingPath = Object.entries(customCategoryPagesByPath).find(
        ([registeredPath]) => {
          const registeredPathWithoutSlashes = registeredPath.replace(/^\/|\/$/g, '');
          return (
            pathWithoutSlashes === registeredPathWithoutSlashes ||
            pathWithoutSlashes.endsWith(`/${registeredPathWithoutSlashes}`) ||
            registeredPathWithoutSlashes.endsWith(`/${pathWithoutSlashes}`)
          );
        },
      );

      if (matchingPath) {
        return matchingPath[1];
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
