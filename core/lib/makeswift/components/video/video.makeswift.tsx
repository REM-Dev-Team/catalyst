'use client';

import { Checkbox, Style, TextInput } from '@makeswift/runtime/controls';
import { MakeswiftComponentType } from '@makeswift/runtime/react/builtins';
import { clsx } from 'clsx';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';

import { runtime } from '~/lib/makeswift/runtime';

interface VideoProps {
  className?: string;
  videoUrl: string | undefined;
  showControls: boolean;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
}

function Video({
  className,
  videoUrl,
  showControls = true,
  autoplay = false,
  muted = false,
  loop = false,
}: VideoProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  useEffect(() => {
    if (!videoUrl) {
      setEmbedUrl('');
      setThumbnailUrl('');

      return;
    }

    // Check if it's a YouTube URL
    const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    if (isYouTubeUrl) {
      // Extract video ID from YouTube URL
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
      const match = youtubeRegex.exec(videoUrl);
      const videoId = match?.[1];

      if (videoId) {
        // Set thumbnail URL (high quality)
        setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);

        // Build YouTube embed URL with proper parameters
        const embedParams = new URLSearchParams();

        embedParams.set('rel', '0');
        embedParams.set('modestbranding', '1');
        embedParams.set('iv_load_policy', '3');
        embedParams.set('fs', '1');

        if (autoplay || isPlaying) {
          embedParams.set('autoplay', '1');
        }

        if (muted) {
          embedParams.set('mute', '1');
        }

        if (loop) {
          embedParams.set('loop', '1');
        }

        embedParams.set('controls', showControls ? '1' : '0');

        if (!showControls) {
          embedParams.set('disablekb', '1');
          embedParams.set('cc_load_policy', '0');
        }

        const newEmbedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${embedParams.toString()}`;

        setEmbedUrl(newEmbedUrl);
      } else {
        setEmbedUrl('');
        setThumbnailUrl('');
      }
    } else {
      setEmbedUrl('');
      setThumbnailUrl('');
    }
  }, [videoUrl, showControls, autoplay, muted, loop, isPlaying]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  if (!videoUrl) {
    return (
      <div
        className={clsx('w-full rounded-xl bg-gray-50 p-4 text-center text-gray-500', className)}
      >
        Enter a video URL to display
      </div>
    );
  }

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  if (isYouTube) {
    if (!embedUrl || !thumbnailUrl) {
      return (
        <div
          className={clsx('w-full rounded-xl bg-gray-50 p-4 text-center text-gray-500', className)}
        >
          Invalid YouTube URL format
        </div>
      );
    }

    // Show thumbnail with custom play button until user clicks
    if (!isPlaying) {
      return (
        <div className={clsx('w-full', className)}>
          <div
            className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg"
            onClick={handlePlay}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePlay();
              }
            }}
            role="button"
            tabIndex={0}
          >
            {/* Thumbnail */}
            <img
              alt="Video thumbnail"
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to standard quality thumbnail if maxresdefault doesn't exist
                const youtubeRegex =
                  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
                const match = youtubeRegex.exec(videoUrl);
                const fallbackVideoId = match?.[1];

                if (fallbackVideoId) {
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  (e.target as HTMLImageElement).src =
                    `https://img.youtube.com/vi/${fallbackVideoId}/hqdefault.jpg`;
                }
              }}
              src={thumbnailUrl}
            />

            {/* Custom play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform group-hover:scale-110 group-hover:bg-red-600">
                <Play className="ml-1 h-10 w-10 text-white" fill="white" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show iframe once user clicks play
    return (
      <div className={clsx('w-full', className)}>
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
            key={embedUrl}
            src={embedUrl}
            title="YouTube video player"
          />
        </div>
      </div>
    );
  }

  // For non-YouTube videos, use HTML5 video element
  return (
    <div className={clsx('w-full', className)}>
      <video
        autoPlay={autoplay}
        className="h-auto w-full rounded-lg"
        controls={showControls}
        loop={loop}
        muted={muted}
        src={videoUrl}
        style={{ aspectRatio: '16/9' }}
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

// Override the built-in Makeswift video component
runtime.registerComponent(Video, {
  type: MakeswiftComponentType.Video,
  label: 'Video',
  props: {
    className: Style(),
    videoUrl: TextInput({
      label: 'Video URL',
      defaultValue: '',
    }),
    showControls: Checkbox({
      label: 'Show controls',
      defaultValue: true,
    }),
    autoplay: Checkbox({
      label: 'Autoplay',
      defaultValue: false,
    }),
    muted: Checkbox({
      label: 'Muted',
      defaultValue: false,
    }),
    loop: Checkbox({
      label: 'Loop',
      defaultValue: false,
    }),
  },
});
