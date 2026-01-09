import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().nullable().optional(),
  content: z.string(),
  date: z.string(),
  image: z
    .object({
      src: z.string(),
      alt: z.string(),
    })
    .optional(),
  href: z.string(),
});

const BlogPostsResponseSchema = z.object({
  status: z.string(),
  posts: z.array(BlogPostSchema),
  pageInfo: z.unknown().nullable(),
});

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then(BlogPostsResponseSchema.parse);

interface Props {
  limit?: number;
  tag?: string | null;
}

export function useBlogPosts({ limit = 6, tag }: Props) {
  const searchParams = new URLSearchParams();

  if (limit) {
    searchParams.append('limit', limit.toString());
  }

  if (tag) {
    searchParams.append('tag', tag);
  }

  const url = `/api/blog-posts?${searchParams.toString()}`;

  const swrResult = useSWR(url, fetcher);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, isLoading } = swrResult;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const error = swrResult.error;

  const blogPosts = useMemo(() => {
    if (isLoading || !data) return null;
    return data.posts;
  }, [isLoading, data]);

  const pageInfo: unknown = data?.pageInfo ?? null;
  return {
    blogPosts,
    isLoading,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error,
    pageInfo,
  };
}
