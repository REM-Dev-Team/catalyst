'use client';

import { Combobox, Style } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

import { runtime } from '~/lib/makeswift/runtime';
import { searchBlogPosts } from '~/lib/makeswift/utils/search-blog-posts';
import { BlogPostCard } from '~/vibes/soul/primitives/blog-post-card';

interface BlogPost {
  id: string;
  title: string;
  author?: string | null;
  content: string;
  date: string;
  image?: {
    src: string;
    alt: string;
  };
  href: string;
}

interface MakeswiftBlogPostCardProps {
  className?: string;
  blogPostId?: string | null;
}

function MakeswiftBlogPostCard({ className, blogPostId }: MakeswiftBlogPostCardProps) {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!blogPostId) {
        setBlogPost(null);

        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(`/api/blog-posts/${blogPostId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const data = (await response.json()) as {
          status?: string;
          post?: unknown;
        };

        if (data.status === 'success' && data.post) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          setBlogPost(data.post as typeof blogPost);
        } else {
          throw new Error('Blog post not found');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
        setBlogPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBlogPost();
  }, [blogPostId]);

  if (isLoading) {
    return (
      <div className={clsx('w-full animate-pulse', className)}>
        <div className="mb-4 aspect-[4/3] rounded-2xl bg-gray-200" />
        <div className="mb-2 h-6 rounded bg-gray-200" />
        <div className="mb-2 h-4 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div
        className={clsx('w-full rounded-xl bg-gray-50 p-4 text-center text-gray-500', className)}
      >
        {error || 'Select a blog post to display'}
      </div>
    );
  }

  return (
    <div className={clsx('w-full', className)}>
      <BlogPostCard blogPost={blogPost} />
    </div>
  );
}

runtime.registerComponent(MakeswiftBlogPostCard, {
  type: 'blog-post-card',
  label: 'Content / Blog Post Card',
  props: {
    className: Style(),
    blogPostId: Combobox({
      label: 'Blog Post',
      async getOptions(query) {
        const posts = await searchBlogPosts(query);

        return posts.map((post) => ({
          id: post.id,
          label: post.title,
          value: post.id,
        }));
      },
    }),
  },
});
