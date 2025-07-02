'use client';

import { TextInput, Style, Checkbox } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';

import { runtime } from '~/lib/makeswift/runtime';
import { BlogPostCard } from '~/vibes/soul/primitives/blog-post-card';
import { 
  Carousel, 
  CarouselButtons, 
  CarouselContent, 
  CarouselItem, 
  CarouselScrollbar 
} from '~/vibes/soul/primitives/carousel';
import { useBlogPosts } from '../../utils/use-blog-posts';

interface MakeswiftBlogPostCarouselProps {
  className?: string;
  title: string;
  ctaLabel?: string;
  ctaUrl?: string;
  limit?: string;
  tag?: string;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  hideOverflow?: boolean;
  showScrollbar?: boolean;
  showButtons?: boolean;
}

function BlogPostCarouselSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="w-full">
        <div className="-ml-4 flex @2xl:-ml-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="min-w-0 shrink-0 grow-0 basis-full pl-4 @md:basis-1/2 @2xl:pl-5 @lg:basis-1/3 @4xl:basis-1/4 @7xl:basis-1/5"
              key={index}
            >
              <div className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-gray-200 mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 flex w-full items-center justify-between gap-8">
        <div className="h-1 w-full max-w-56 rounded bg-gray-200 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function MakeswiftBlogPostCarousel({
  className,
  title,
  ctaLabel,
  ctaUrl,
  limit = '6',
  tag,
  scrollbarLabel = 'Blog posts',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  hideOverflow = true,
  showScrollbar = true,
  showButtons = true,
}: MakeswiftBlogPostCarouselProps) {
  const limitNumber = parseInt(limit) || 6;
  const { blogPosts, isLoading, error } = useBlogPosts({
    limit: limitNumber,
    tag: tag || null,
  });

  if (isLoading) {
    return <BlogPostCarouselSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={clsx('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium">{title}</h2>
          {ctaLabel && ctaUrl && (
            <a href={ctaUrl} className="text-sm underline hover:no-underline">
              {ctaLabel}
            </a>
          )}
        </div>
        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
          Failed to load blog posts. Please try again later.
        </div>
      </div>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className={clsx('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium">{title}</h2>
          {ctaLabel && ctaUrl && (
            <a href={ctaUrl} className="text-sm underline hover:no-underline">
              {ctaLabel}
            </a>
          )}
        </div>
        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
          No blog posts found.
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">{title}</h2>
        {ctaLabel && ctaUrl && (
          <a href={ctaUrl} className="text-sm underline hover:no-underline">
            {ctaLabel}
          </a>
        )}
      </div>
      
      <Carousel className="group/blog-post-carousel" hideOverflow={hideOverflow}>
        <CarouselContent className="mb-10">
          {blogPosts.map((post) => (
            <CarouselItem
              className="basis-full @md:basis-1/2 @lg:basis-1/3 @4xl:basis-1/4 @7xl:basis-1/5"
              key={post.id}
            >
              <BlogPostCard blogPost={post} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex w-full items-center justify-between">
          {showScrollbar && <CarouselScrollbar label={scrollbarLabel} />}
          {showButtons && <CarouselButtons nextLabel={nextLabel} previousLabel={previousLabel} />}
        </div>
      </Carousel>
    </div>
  );
}

runtime.registerComponent(MakeswiftBlogPostCarousel, {
  type: 'blog-post-carousel',
  label: 'Content / Blog Post Carousel',
  props: {
    className: Style(),
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Latest Blog Posts'
    }),
    ctaLabel: TextInput({ 
      label: 'CTA Label', 
      defaultValue: 'View all posts'
    }),
    ctaUrl: TextInput({ 
      label: 'CTA URL', 
      defaultValue: '/blog'
    }),
    limit: TextInput({ 
      label: 'Number of posts', 
      defaultValue: '6'
    }),
    tag: TextInput({ 
      label: 'Filter by tag (optional)', 
      defaultValue: ''
    }),
    scrollbarLabel: TextInput({ 
      label: 'Scrollbar label', 
      defaultValue: 'Blog posts'
    }),
    previousLabel: TextInput({ 
      label: 'Previous button label', 
      defaultValue: 'Previous'
    }),
    nextLabel: TextInput({ 
      label: 'Next button label', 
      defaultValue: 'Next'
    }),
    hideOverflow: Checkbox({
      label: 'Hide overflow',
      defaultValue: true,
    }),
    showScrollbar: Checkbox({
      label: 'Show scrollbar',
      defaultValue: true,
    }),
    showButtons: Checkbox({
      label: 'Show buttons',
      defaultValue: true,
    }),
  },
}); 