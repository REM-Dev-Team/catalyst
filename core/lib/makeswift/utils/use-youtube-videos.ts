import useSWR from 'swr';

import { YouTubeVideo } from '~/lib/youtube/utils';

interface UseYouTubeVideosOptions {
  channelId?: string | null;
  playlistId?: string | null;
  limit?: number;
}

export function useYouTubeVideos({ channelId, playlistId, limit = 10 }: UseYouTubeVideosOptions) {
  const shouldFetch = !!(channelId || playlistId);

  const swrResult = useSWR<YouTubeVideo[]>(
    shouldFetch ? ['youtube-videos', channelId, playlistId, limit] : null,
    async () => {
      try {
        if (!channelId && !playlistId) {
          throw new Error('Channel ID or Playlist ID is required');
        }

        // Use our API route instead of direct YouTube API calls
        const params = new URLSearchParams();

        if (channelId) params.append('channelId', channelId);
        if (playlistId) params.append('playlistId', playlistId);
        params.append('limit', limit.toString());

        const response = await fetch(`/api/youtube/videos?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch YouTube videos');
        }

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const data = (await response.json()) as {
          error?: string;
          videos?: YouTubeVideo[];
        };

        if (data.error) {
          throw new Error(data.error);
        }

        return data.videos ?? [];
      } catch (fetchError) {
        // eslint-disable-next-line no-console
        console.error('Error fetching YouTube videos:', fetchError);
        throw fetchError;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
      keepPreviousData: true, // Keep previous data while loading new data
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: videos, error, isLoading } = swrResult;

  return {
    videos,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
