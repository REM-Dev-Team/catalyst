'use client';

import { useEffect, useState } from 'react';
import { TextInput, Style, Checkbox } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';
import { Play, Eye, Clock } from 'lucide-react';

import { runtime } from '~/lib/makeswift/runtime';
import { YouTubeVideoCard } from '~/vibes/soul/primitives/youtube-video-card';
import { 
  Carousel, 
  CarouselButtons, 
  CarouselContent, 
  CarouselItem, 
  CarouselScrollbar 
} from '~/vibes/soul/primitives/carousel';
import { useYouTubeVideos } from '../../utils/use-youtube-videos';

interface MakeswiftYouTubeVideoCarouselProps {
  className?: string;
  title: string;
  ctaLabel?: string;
  ctaUrl?: string;
  limit?: string;
  channelId?: string;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  hideOverflow?: boolean;
  showScrollbar?: boolean;
  showButtons?: boolean;
}

// Custom hook to detect screen size
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isDesktop;
}

function YouTubeVideoCarouselSkeleton({ className }: { className?: string }) {
  const isDesktop = useIsDesktop();

  return (
    <div className={clsx('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      
      {isDesktop ? (
        // Desktop: Vertical skeleton
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="w-full" key={index}>
              <div className="animate-pulse">
                <div className="aspect-video rounded-2xl bg-gray-200 mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Mobile: Horizontal skeleton
        <div className="-ml-4 flex">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="min-w-0 shrink-0 grow-0 basis-full pl-4"
              key={index}
            >
              <div className="animate-pulse">
                <div className="aspect-video rounded-2xl bg-gray-200 mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isDesktop && (
        <div className="mt-10 flex w-full items-center justify-between gap-8">
          <div className="h-1 w-full max-w-56 rounded bg-gray-200 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}

function MakeswiftYouTubeVideoCarousel({
  className,
  title,
  ctaLabel,
  ctaUrl,
  limit = '6',
  channelId,
  scrollbarLabel = 'YouTube videos',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  hideOverflow = true,
  showScrollbar = true,
  showButtons = true,
}: MakeswiftYouTubeVideoCarouselProps) {
  const limitNumber = parseInt(limit) || 6;
  const isDesktop = useIsDesktop();
  const { videos, isLoading, error } = useYouTubeVideos({
    channelId: channelId || undefined,
    limit: limitNumber,
  });

  // Helper function to render header
  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-medium">{title}</h2>
      {ctaLabel && ctaUrl && (
        <a href={ctaUrl} className="text-sm underline hover:no-underline">
          {ctaLabel}
        </a>
      )}
    </div>
  );

  if (isLoading) {
    return <YouTubeVideoCarouselSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={clsx('space-y-6', className)}>
        {renderHeader()}
        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
          Failed to load YouTube videos. Please check your API key and channel settings.
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={clsx('space-y-6', className)}>
        {renderHeader()}
        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
          No YouTube videos found.
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {renderHeader()}
      
      {isDesktop ? (
        // Desktop: Vertical list with horizontal layout
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="flex gap-4 group">
              <div className="flex-shrink-0">
                <a 
                  href={video.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block aspect-video rounded-2xl overflow-hidden relative bg-contrast-100"
                  style={{ width: '192px' }}
                >
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white transition-transform duration-300 group-hover:scale-110">
                      <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                    {video.duration}
                  </div>
                </a>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-medium leading-snug mb-2 font-[family-name:var(--card-font-family,var(--font-family-body))]">
                    <a href={video.href} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary">
                      {video.title}
                    </a>
                  </h3>
                  <p className="line-clamp-2 text-sm font-normal text-contrast-400 font-[family-name:var(--card-font-family,var(--font-family-body))]">
                    {video.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-contrast-500 mt-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{video.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <time dateTime={video.publishedAt}>
                      {new Date(video.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Mobile: Horizontal carousel
        <Carousel className="group/youtube-video-carousel" hideOverflow={hideOverflow}>
          <CarouselContent className="mb-10">
            {videos.map((video) => (
              <CarouselItem
                className="basis-full"
                key={video.id}
              >
                <YouTubeVideoCard video={video} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex w-full items-center justify-between">
            {showScrollbar && <CarouselScrollbar label={scrollbarLabel} />}
            {showButtons && <CarouselButtons nextLabel={nextLabel} previousLabel={previousLabel} />}
          </div>
        </Carousel>
      )}
    </div>
  );
}

runtime.registerComponent(MakeswiftYouTubeVideoCarousel, {
  type: 'youtube-video-carousel',
  label: 'Content / YouTube Video Carousel',
  props: {
    className: Style(),
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Latest Videos'
    }),
    ctaLabel: TextInput({ 
      label: 'CTA Label', 
      defaultValue: 'View all videos'
    }),
    ctaUrl: TextInput({ 
      label: 'CTA URL', 
      defaultValue: 'https://youtube.com'
    }),
    limit: TextInput({ 
      label: 'Number of videos', 
      defaultValue: '6'
    }),
    channelId: TextInput({ 
      label: 'YouTube Channel ID (optional)', 
      defaultValue: ''
    }),
    scrollbarLabel: TextInput({ 
      label: 'Scrollbar label', 
      defaultValue: 'YouTube videos'
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