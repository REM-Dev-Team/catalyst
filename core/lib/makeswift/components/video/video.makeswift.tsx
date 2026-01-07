'use client';

import { useState, useEffect } from 'react';
import { Style, TextInput, Checkbox } from '@makeswift/runtime/controls';
// MakeswiftComponentType is no longer exported in newer versions
import { clsx } from 'clsx';
import { Play } from 'lucide-react';

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
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    if (isYouTube) {
      // Extract video ID from YouTube URL
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];

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
      <div className={clsx('w-full p-4 text-center text-gray-500 bg-gray-50 rounded-xl', className)}>
        Enter a video URL to display
      </div>
    );
  }

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  if (isYouTube) {
    if (!embedUrl || !thumbnailUrl) {
      return (
        <div className={clsx('w-full p-4 text-center text-gray-500 bg-gray-50 rounded-xl', className)}>
          Invalid YouTube URL format
        </div>
      );
    }

    // Show thumbnail with custom play button until user clicks
    if (!isPlaying) {
      return (
        <div className={clsx('w-full', className)}>
          <div
            className="aspect-video w-full overflow-hidden rounded-lg relative cursor-pointer group"
            onClick={handlePlay}
          >
            {/* Thumbnail */}
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to standard quality thumbnail if maxresdefault doesn't exist
                const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                if (videoId) {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }
              }}
            />

            {/* Custom play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg group-hover:bg-red-600 group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
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
            key={embedUrl}
            src={embedUrl}
            title="YouTube video player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // For non-YouTube videos, use HTML5 video element
  return (
    <div className={clsx('w-full', className)}>
      <video
        src={videoUrl}
        controls={showControls}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        className="w-full h-auto rounded-lg"
        style={{ aspectRatio: '16/9' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

// Override the built-in Makeswift video component
runtime.registerComponent(Video, {
  type: 'Video',
  label: 'Video',
  props: {
    className: Style(),
    videoUrl: TextInput({
      label: 'Video URL',
      defaultValue: ''
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
