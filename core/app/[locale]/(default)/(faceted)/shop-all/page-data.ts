import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const ShopAllPageQuery = graphql(`
  query ShopAllPageQuery {
    site {
      settings {
        storefront {
          catalog {
            productComparisonsEnabled
          }
        }
      }
    }
  }
`);

export const getShopAllPageData = cache(async () => {
  const response = await client.fetch({
    document: ShopAllPageQuery,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site;
});
