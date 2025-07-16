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

function MakeswiftYouTubeVideoCard({
  className,
  videoUrl,
}: MakeswiftYouTubeVideoCardProps) {
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = regex.exec(url);

    return match?.[1] ? String(match[1]) : null;
  };

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
        const response = await fetch(
          `/api/youtube/video?videoUrl=${encodeURIComponent(videoUrl)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setVideo(data.video);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
        setVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoUrl]);

  if (isLoading) {
    return (
      <div className={clsx('w-full animate-pulse', className)}>
        <div className="aspect-video rounded-2xl bg-gray-200 mb-4" />
        <div className="h-6 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className={clsx('w-full p-4 text-center text-gray-500 bg-gray-50 rounded-xl', className)}>
        {error || 'Enter a YouTube video URL to display'}
      </div>
    );
  }

  const videoId = extractVideoId(video.href);

  return (
    <div className={clsx('w-full', className)}>
      <YouTubeVideoCard video={video} />
      
      {/* Videos open in dedicated video page */}
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
      defaultValue: undefined
    }),

  },
}); 