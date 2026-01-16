'use client';

import { Checkbox, Style, TextInput } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';
import { Clock, Eye, Play } from 'lucide-react'; // Play and Eye are used in JSX below
import { useEffect, useState } from 'react';

import { YouTubeVideoModal } from '~/lib/makeswift/components/youtube-video-modal';
import { runtime } from '~/lib/makeswift/runtime';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '~/vibes/soul/primitives/carousel';
import { YouTubeVideoCard } from '~/vibes/soul/primitives/youtube-video-card';

import { useYouTubeVideos } from '../../utils/use-youtube-videos';

interface MakeswiftYouTubeVideoCarouselProps {
  className?: string;
  title: string;
  ctaLabel?: string;
  ctaUrl?: string;
  limit?: string;
  channelId?: string;
  playlistId?: string;
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
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>

      {isDesktop ? (
        // Desktop: Vertical skeleton
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div className="w-full" key={index}>
              <div className="animate-pulse">
                <div className="mb-4 aspect-video rounded-2xl bg-gray-200" />
                <div className="mb-2 h-6 rounded bg-gray-200" />
                <div className="mb-2 h-4 rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Mobile: Horizontal skeleton
        <div className="-ml-4 flex">
          {[0, 1, 2].map((index) => (
            <div className="min-w-0 shrink-0 grow-0 basis-full pl-4" key={index}>
              <div className="animate-pulse">
                <div className="mb-4 aspect-video rounded-2xl bg-gray-200" />
                <div className="mb-2 h-6 rounded bg-gray-200" />
                <div className="mb-2 h-4 rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isDesktop && (
        <div className="mt-10 flex w-full items-center justify-between gap-8">
          <div className="h-1 w-full max-w-56 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
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
  playlistId,
  scrollbarLabel = 'YouTube videos',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  hideOverflow = true,
  showScrollbar = true,
  showButtons = true,
}: MakeswiftYouTubeVideoCarouselProps) {
  const limitNumber = parseInt(limit, 10) || 6;
  const isDesktop = useIsDesktop();
  const { videos, isLoading, error } = useYouTubeVideos({
    channelId: channelId || undefined,
    playlistId: playlistId || undefined,
    limit: limitNumber,
  });

  // Helper function to render header
  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-medium">{title}</h2>
      {ctaLabel && ctaUrl ? (
        <a className="text-sm underline hover:no-underline" href={ctaUrl}>
          {ctaLabel}
        </a>
      ) : null}
    </div>
  );

  if (isLoading) {
    return <YouTubeVideoCarouselSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={clsx('space-y-6', className)}>
        {renderHeader()}
        <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
          Failed to load YouTube videos. Please check your API key and channel settings.
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={clsx('space-y-6', className)}>
        {renderHeader()}
        <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
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
            <div className="group flex gap-4" key={video.id}>
              <YouTubeVideoModal
                trigger={
                  <div className="group flex cursor-pointer gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className="relative block aspect-video overflow-hidden rounded-2xl bg-contrast-100"
                        style={{ width: '192px' }}
                      >
                        <img
                          alt={video.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          src={video.thumbnail}
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white transition-transform duration-300 group-hover:scale-110">
                            <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                          </div>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                          {video.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="mb-2 font-[family-name:var(--card-font-family,var(--font-family-body))] text-lg font-medium leading-snug text-foreground hover:text-primary">
                          {video.title}
                        </h3>
                        <p className="line-clamp-2 font-[family-name:var(--card-font-family,var(--font-family-body))] text-sm font-normal text-contrast-400">
                          {video.description}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-contrast-500">
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
                }
                video={video}
              />
            </div>
          ))}
        </div>
      ) : (
        // Mobile: Horizontal carousel
        <Carousel className="group/youtube-video-carousel" hideOverflow={hideOverflow}>
          <CarouselContent className="mb-10">
            {videos.map((video) => (
              <CarouselItem className="basis-full" key={video.id}>
                <YouTubeVideoCard video={video} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex w-full items-center justify-between">
            {showScrollbar ? <CarouselScrollbar label={scrollbarLabel} /> : null}
            {showButtons ? (
              <CarouselButtons nextLabel={nextLabel} previousLabel={previousLabel} />
            ) : null}
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
      defaultValue: 'Latest Videos',
    }),
    ctaLabel: TextInput({
      label: 'CTA Label',
      defaultValue: 'View all videos',
    }),
    ctaUrl: TextInput({
      label: 'CTA URL',
      defaultValue: 'https://youtube.com',
    }),
    limit: TextInput({
      label: 'Number of videos',
      defaultValue: '6',
    }),
    channelId: TextInput({
      label: 'YouTube Channel ID (optional)',
      defaultValue: '',
    }),
    playlistId: TextInput({
      label: 'YouTube Playlist ID or URL (optional)',
      defaultValue: '',
    }),
    scrollbarLabel: TextInput({
      label: 'Scrollbar label',
      defaultValue: 'YouTube videos',
    }),
    previousLabel: TextInput({
      label: 'Previous button label',
      defaultValue: 'Previous',
    }),
    nextLabel: TextInput({
      label: 'Next button label',
      defaultValue: 'Next',
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
