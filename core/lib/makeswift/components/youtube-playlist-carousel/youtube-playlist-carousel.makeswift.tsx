'use client';

import { useEffect, useState } from 'react';
import { TextInput, Style, Checkbox } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';
import { Play, Eye, Clock } from 'lucide-react';

import { runtime } from '~/lib/makeswift/runtime';
import { YouTubeVideoCard } from '~/vibes/soul/primitives/youtube-video-card';
import { YouTubeVideoModal } from '~/lib/makeswift/components/youtube-video-modal';
import { 
  Carousel, 
  CarouselButtons, 
  CarouselContent, 
  CarouselItem, 
  CarouselScrollbar 
} from '~/vibes/soul/primitives/carousel';
import { useYouTubePlaylist } from '../../utils/use-youtube-playlist';

interface MakeswiftYouTubePlaylistCarouselProps {
  className?: string;
  title: string;
  ctaLabel?: string;
  ctaUrl?: string;
  limit?: string;
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
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);

    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
}

function YouTubePlaylistCarouselSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Desktop skeleton */}
      <div className="hidden lg:block space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0">
              <div 
                className="bg-gray-200 rounded-2xl animate-pulse"
                style={{ width: '192px', height: '108px' }}
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile skeleton */}
      <div className="lg:hidden">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl animate-pulse" style={{ height: '200px' }} />
          ))}
        </div>
        <div className="flex w-full items-center justify-between mt-4">
          <div className="h-2 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MakeswiftYouTubePlaylistCarousel({
  className,
  title,
  ctaLabel,
  ctaUrl,
  limit = '6',
  playlistId,
  scrollbarLabel = 'YouTube playlist videos',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  hideOverflow = true,
  showScrollbar = true,
  showButtons = true,
}: MakeswiftYouTubePlaylistCarouselProps) {
  
  const isDesktop = useIsDesktop();
  const limitNumber = parseInt(limit, 10) || 6;
  
  const { videos, isLoading, error } = useYouTubePlaylist({
    playlistId: playlistId || undefined,
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
    return <YouTubePlaylistCarouselSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={clsx('space-y-6', className)}>
        {renderHeader()}
        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
          Failed to load YouTube playlist videos. Please check your API key and playlist settings.
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={clsx('space-y-6', className)}>
        {renderHeader()}
        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
          No YouTube playlist videos found.
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
              <YouTubeVideoModal
                video={video}
                trigger={
                  <div className="flex gap-4 group cursor-pointer">
                    <div className="flex-shrink-0">
                      <div 
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
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{video.viewCount} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        // Mobile: Horizontal carousel
        <Carousel className="group/youtube-playlist-carousel" hideOverflow={hideOverflow}>
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

runtime.registerComponent(MakeswiftYouTubePlaylistCarousel, {
  type: 'youtube-playlist-carousel',
  label: 'Content / YouTube Playlist Carousel',
  props: {
    className: Style(),
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Playlist Videos'
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
    playlistId: TextInput({ 
      label: 'YouTube Playlist ID or URL', 
      defaultValue: ''
    }),
    scrollbarLabel: TextInput({ 
      label: 'Scrollbar label', 
      defaultValue: 'YouTube playlist videos'
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
