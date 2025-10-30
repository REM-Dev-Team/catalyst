'use client';

import { useEffect, useState } from 'react';
import { TextInput, Style, Checkbox } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';

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

interface MakeswiftYouTubeVideoCarouselRowProps {
  className?: string;
  title: string;
  ctaLabel?: string;
  ctaUrl?: string;
  limit?: string;
  channelId?: string;
  componentId?: string;
  playlist1Id?: string;
  playlist1Label?: string;
  playlist2Id?: string;
  playlist2Label?: string;
  playlist3Id?: string;
  playlist3Label?: string;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  hideOverflow?: boolean;
  showScrollbar?: boolean;
  showButtons?: boolean;
}

function YouTubeVideoCarouselRowSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      
      {/* Horizontal skeleton for both desktop and mobile */}
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

function MakeswiftYouTubeVideoCarouselRow({
  className,
  title,
  ctaLabel,
  ctaUrl,
  limit = '6',
  channelId,
  componentId,
  playlist1Id,
  playlist1Label = 'Playlist 1',
  playlist2Id,
  playlist2Label = 'Playlist 2',
  playlist3Id,
  playlist3Label = 'Playlist 3',
  scrollbarLabel = 'YouTube videos',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  hideOverflow = true,
  showScrollbar = true,
  showButtons = true,
}: MakeswiftYouTubeVideoCarouselRowProps) {
  const limitNumber = parseInt(limit) || 6;
  const [activePlaylist, setActivePlaylist] = useState<string | undefined>(playlist1Id);
  
  // Listen for external playlist switch events from a separate button component
  useEffect(() => {
    if (!componentId) return;
    const eventName = `yt-playlist-switch:${componentId}`;
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ playlistId?: string }>; 
      setActivePlaylist(custom.detail?.playlistId);
    };
    window.addEventListener(eventName, handler as EventListener);
    return () => {
      window.removeEventListener(eventName, handler as EventListener);
    };
  }, [componentId]);
  
  // Create playlist options
  const playlists = [
    { id: playlist1Id, label: playlist1Label },
    { id: playlist2Id, label: playlist2Label },
    { id: playlist3Id, label: playlist3Label },
  ].filter(playlist => playlist.id); // Only include playlists with IDs
  
  const { videos, isLoading, error } = useYouTubeVideos({
    channelId: channelId || undefined,
    playlistId: activePlaylist || undefined,
    limit: limitNumber,
  });

  // Helper function to render header (buttons moved to separate component via events)
  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-medium" style={{ color: '#f8f8f2' }}>{title}</h2>
      {ctaLabel && ctaUrl && (
        <a href={ctaUrl} className="text-sm underline hover:no-underline" style={{ color: '#f8f8f2' }}>
          {ctaLabel}
        </a>
      )}
    </div>
  );

  if (isLoading && !videos) {
    return <YouTubeVideoCarouselRowSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={clsx('space-y-6', className)}>
        {renderHeader()}
        <div className="p-6 text-center bg-gray-50 rounded-xl" style={{ color: '#f8f8f2' }}>
          Failed to load YouTube videos. Please check your API key and channel settings.
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={clsx('space-y-6', className)}>
        {renderHeader()}
        <div className="p-6 text-center bg-gray-50 rounded-xl" style={{ color: '#f8f8f2' }}>
          No YouTube videos found.
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {renderHeader()}
      
      {/* Horizontal carousel for both desktop and mobile */}
      <Carousel className="group/youtube-video-carousel" hideOverflow={hideOverflow}>
        <CarouselContent className="mb-10">
        {videos.map((video) => (
          <CarouselItem
            className="basis-full"
            key={video.id}
          >
            <YouTubeVideoCard video={video} textColor="#f8f8f2" />
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

runtime.registerComponent(MakeswiftYouTubeVideoCarouselRow, {
  type: 'youtube-video-carousel-row',
  label: 'Content / YouTube Video Carousel (Row)',
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
    componentId: TextInput({ 
      label: 'Shared Component ID (for playlist switcher)', 
      defaultValue: ''
    }),
    playlist1Id: TextInput({ 
      label: 'Playlist 1 ID', 
      defaultValue: ''
    }),
    playlist1Label: TextInput({ 
      label: 'Playlist 1 Label', 
      defaultValue: 'Playlist 1'
    }),
    playlist2Id: TextInput({ 
      label: 'Playlist 2 ID', 
      defaultValue: ''
    }),
    playlist2Label: TextInput({ 
      label: 'Playlist 2 Label', 
      defaultValue: 'Playlist 2'
    }),
    playlist3Id: TextInput({ 
      label: 'Playlist 3 ID', 
      defaultValue: ''
    }),
    playlist3Label: TextInput({ 
      label: 'Playlist 3 Label', 
      defaultValue: 'Playlist 3'
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
