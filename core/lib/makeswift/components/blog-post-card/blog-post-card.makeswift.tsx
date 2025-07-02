'use client';

import { useEffect, useState } from 'react';
import { Style, Combobox } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';

import { runtime } from '~/lib/makeswift/runtime';
import { BlogPostCard } from '~/vibes/soul/primitives/blog-post-card';
import { searchBlogPosts } from '~/lib/makeswift/utils/search-blog-posts';

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

function MakeswiftBlogPostCard({
  className,
  blogPostId,
}: MakeswiftBlogPostCardProps) {
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
        
        const data = await response.json();
        
        if (data.status === 'success' && data.post) {
          setBlogPost(data.post);
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

    fetchBlogPost();
  }, [blogPostId]);

  if (isLoading) {
    return (
      <div className={clsx('w-full animate-pulse', className)}>
        <div className="aspect-[4/3] rounded-2xl bg-gray-200 mb-4" />
        <div className="h-6 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className={clsx('w-full p-4 text-center text-gray-500 bg-gray-50 rounded-xl', className)}>
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