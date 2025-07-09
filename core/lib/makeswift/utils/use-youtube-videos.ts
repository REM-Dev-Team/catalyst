import useSWR from 'swr';
import { YouTubeVideo } from '~/lib/youtube/utils';

interface UseYouTubeVideosOptions {
  channelId?: string | null;
  limit?: number;
}

export function useYouTubeVideos({
  channelId,
  limit = 10,
}: UseYouTubeVideosOptions) {
  const shouldFetch = !!channelId;
  
  const { data: videos, error, isLoading } = useSWR<YouTubeVideo[]>(
    shouldFetch ? ['youtube-videos', channelId, limit] : null,
    async () => {
      try {
        if (!channelId) {
          throw new Error('Channel ID is required');
        }

        // Use our API route instead of direct YouTube API calls
        const response = await fetch(
          `/api/youtube/videos?channelId=${channelId}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch YouTube videos');
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        return data.videos || [];
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        throw error;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    videos,
    isLoading,
    error: error?.message || null,
  };
} 