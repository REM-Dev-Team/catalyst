import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BlogPostsPageQuery = graphql(
  `
    query BlogPostsPageQuery(
      $first: Int
      $after: String
      $last: Int
      $before: String
      $filters: BlogPostsFiltersInput
    ) {
      site {
        content {
          blog {
            posts(first: $first, after: $after, last: $last, before: $before, filters: $filters) {
              edges {
                node {
                  author
                  entityId
                  name
                  path
                  plainTextSummary
                  publishedDate {
                    utc
                  }
                  thumbnailImage {
                    url: urlTemplate(lossy: true)
                    altText
                  }
                }
              }
              pageInfo {
                ...PaginationFragment
              }
            }
          }
        }
      }
    }
  `,
  [PaginationFragment],
);

const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '6', 10)),
  tag: z
    .string()
    .optional()
    .transform((val) => val || null),
});

export const GET = async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams.entries());

    const parseResult = querySchema.safeParse(query);

    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid query parameters' },
        { status: 400 },
      );
    }

    const { limit, tag } = parseResult.data;

    const filterArgs = tag ? { filters: { tags: [tag] } } : {};
    const paginationArgs = { first: limit };

    const response = await client.fetch({
      document: BlogPostsPageQuery,
      variables: { ...filterArgs, ...paginationArgs },
      fetchOptions: { next: { revalidate } },
    });

    const { blog } = response.data.site.content;

    if (!blog) {
      return NextResponse.json({
        status: 'success',
        posts: [],
        pageInfo: null,
      });
    }

    const posts = removeEdgesAndNodes(blog.posts).map((post) => ({
      id: String(post.entityId),
      author: post.author,
      content: post.plainTextSummary,
      date: new Date(post.publishedDate.utc).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      image: post.thumbnailImage
        ? {
            src: post.thumbnailImage.url,
            alt: post.thumbnailImage.altText,
          }
        : undefined,
      href: post.path,
      title: post.name,
    }));

    return NextResponse.json({
      status: 'success',
      posts,
      pageInfo: blog.posts.pageInfo,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);

    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch blog posts' },
      { status: 500 },
    );
  }
};
