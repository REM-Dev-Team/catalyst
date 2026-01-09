'use client';

import { useEffect, useState } from 'react';
import { Style, TextInput } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';

import { runtime } from '~/lib/makeswift/runtime';
import { YouTubeVideoCard } from '~/vibes/soul/primitives/youtube-video-card';
import { YouTubeVideo } from '~/lib/youtube/utils';

interface MakeswiftYouTubeVideoCardProps {
  className: string;
  videoUrl: string | undefined;
}

function MakeswiftYouTubeVideoCard({ className, videoUrl }: MakeswiftYouTubeVideoCardProps) {
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoUrl) {
        setVideo(null);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        // Use our API route instead of direct YouTube API calls
        const response = await fetch(`/api/youtube/video?videoUrl=${encodeURIComponent(videoUrl)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const responseData: unknown = await response.json();
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const data = responseData as {
          error?: string;
          video?: YouTubeVideo;
        };

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.video) {
          setVideo(data.video);
        } else {
          throw new Error('Video not found');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching video:', err);
        setError('Failed to load video');
        setVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVideo();
  }, [videoUrl]);

  if (isLoading) {
    return (
      <div className={clsx('w-full animate-pulse', className)}>
        <div className="mb-4 aspect-video rounded-2xl bg-gray-200" />
        <div className="mb-2 h-6 rounded bg-gray-200" />
        <div className="mb-2 h-4 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
    );
  }

  if (!video) {
    return (
      <div
        className={clsx('w-full rounded-xl bg-gray-50 p-4 text-center text-gray-500', className)}
      >
        {error || 'Enter a YouTube video URL to display'}
      </div>
    );
  }

  return (
    <div className={clsx('w-full', className)}>
      <YouTubeVideoCard video={video} />
    </div>
  );
}

runtime.registerComponent(MakeswiftYouTubeVideoCard, {
  type: 'youtube-video-card',
  label: 'Content / YouTube Video Card',
  props: {
    className: Style(),
    videoUrl: TextInput({
      label: 'YouTube Video URL',
      defaultValue: undefined,
    }),
  },
});
