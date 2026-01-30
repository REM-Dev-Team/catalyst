'use client';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { Play } from 'lucide-react';
import { useState } from 'react';

import { Image } from '~/components/image';

interface Video {
  videoUrl: string;
  videoId: string;
  videoType: string;
  title: string;
}

interface Props {
  videos: Streamable<Video[]>;
  title?: string;
}

function getVideoEmbedUrl(videoUrl: string, videoType: string, videoId: string): string {
  if (videoType === 'youtube' && videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  if (videoType === 'vimeo' && videoId) {
    return `https://player.vimeo.com/video/${videoId}`;
  }
  // For YouTube URLs, extract ID
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = youtubeRegex.exec(videoUrl);
    const id = match?.[1];
    if (id) {
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }
  }
  return videoUrl;
}

function getVideoThumbnail(video: Video): string {
  // Generate thumbnail for YouTube videos
  if (video.videoType === 'youtube' && video.videoId) {
    return `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
  }
  return '';
}

export const Videos = ({ videos: streamableVideos, title = 'Videos' }: Props) => {
  return (
    <SectionLayout containerSize="2xl">
      <Stream fallback={null} value={streamableVideos}>
        {(videos) => {
          if (videos.length === 0) {
            return null;
          }

          return (
            <>
              <div className="mb-6 flex w-full flex-row flex-wrap items-end justify-between gap-x-8 gap-y-6 @4xl:mb-8">
                <header className="font-[family-name:var(--featured-product-carousel-font-family,var(--font-family-body))]">
                  <h2 className="font-[family-name:var(--featured-product-carousel-title-font-family,var(--font-family-heading))] text-2xl leading-none text-[var(--featured-product-carousel-title,hsl(var(--foreground)))] @xl:text-3xl @4xl:text-4xl">
                    {title}
                  </h2>
                </header>
              </div>
              <div className="grid grid-cols-1 gap-6 @md:grid-cols-2 @xl:grid-cols-3">
                {videos.map((video, index) => (
                  <VideoCard key={index} video={video} />
                ))}
              </div>
            </>
          );
        }}
      </Stream>
    </SectionLayout>
  );
};

function VideoCard({ video }: { video: Video }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnailUrl = getVideoThumbnail(video);
  const embedUrl = getVideoEmbedUrl(video.videoUrl, video.videoType, video.videoId);

  if (isPlaying) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
          src={embedUrl}
          title={video.title}
        />
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg"
      onClick={() => setIsPlaying(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsPlaying(true);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {thumbnailUrl ? (
        <Image
          alt={video.title}
          className="h-full w-full object-cover"
          fill
          sizes="(min-width: 42rem) 33vw, (min-width: 28rem) 50vw, 100vw"
          src={thumbnailUrl}
        />
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform group-hover:scale-110 group-hover:bg-red-600">
          <Play className="ml-1 h-10 w-10 text-white" fill="white" />
        </div>
      </div>
    </div>
  );
}
