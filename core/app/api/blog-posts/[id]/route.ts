import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BlogPostQuery = graphql(`
  query BlogPostQuery($entityId: Int!) {
    site {
      content {
        blog {
          post(entityId: $entityId) {
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
      }
    }
  }
`);

const querySchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
});

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    
    const parseResult = querySchema.safeParse({ id });
    
    if (!parseResult.success) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid blog post ID' },
        { status: 400 }
      );
    }

    const { id: entityId } = parseResult.data;

    const response = await client.fetch({
      document: BlogPostQuery,
      variables: { entityId },
      fetchOptions: { next: { revalidate } },
    });

    const { blog } = response.data.site.content;

    if (!blog?.post) {
      return NextResponse.json(
        { status: 'error', error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const post = blog.post;

    const blogPost = {
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
    };

    return NextResponse.json({
      status: 'success',
      post: blogPost,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}; 