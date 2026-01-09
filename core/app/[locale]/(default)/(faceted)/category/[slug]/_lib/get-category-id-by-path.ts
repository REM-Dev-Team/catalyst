import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const GetCategoryByPathQuery = graphql(`
  query GetCategoryByPath($path: String!) {
    site {
      route(path: $path, redirectBehavior: FOLLOW) {
        node {
          __typename
          ... on Category {
            entityId
          }
        }
      }
    }
  }
`);

/**
 * Gets the category entityId from a category path.
 * This is useful for finding the category ID when you only know the URL path.
 *
 * @param path - The category path (e.g., "/iron-sights/")
 * @returns The category entityId if found, null otherwise
 */
export const getCategoryIdByPath = cache(async (path: string): Promise<number | null> => {
  try {
    const response = await client.fetch({
      document: GetCategoryByPathQuery,
      variables: { path },
      fetchOptions: { next: { revalidate } },
    });

    const node = response.data.site.route.node;

    if (node?.__typename === 'Category') {
      return node.entityId;
    }

    return null;
  } catch {
    return null;
  }
});
