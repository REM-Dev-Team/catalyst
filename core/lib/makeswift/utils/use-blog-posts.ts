import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

const BlogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().nullable().optional(),
  content: z.string(),
  date: z.string(),
  image: z.object({
    src: z.string(),
    alt: z.string(),
  }).optional(),
  href: z.string(),
});

const BlogPostsResponseSchema = z.object({
  status: z.string(),
  posts: z.array(BlogPostSchema),
  pageInfo: z.any().nullable(),
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

  const { data, isLoading, error } = useSWR(url, fetcher);

  const blogPosts = useMemo(() => {
    if (isLoading || !data) return null;
    return data.posts;
  }, [isLoading, data]);

  return { 
    blogPosts, 
    isLoading, 
    error,
    pageInfo: data?.pageInfo 
  };
} 