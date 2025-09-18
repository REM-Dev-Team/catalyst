import useSWR from 'swr';
import { YouTubeVideo } from '~/lib/youtube/utils';

interface UseYouTubePlaylistOptions {
  playlistId?: string | null;
  limit?: number;
}

export function useYouTubePlaylist({
  playlistId,
  limit = 10,
}: UseYouTubePlaylistOptions) {
  const shouldFetch = !!playlistId;
  
  const { data: videos, error, isLoading } = useSWR<YouTubeVideo[]>(
    shouldFetch ? ['youtube-playlist', playlistId, limit] : null,
    async () => {
      try {
        if (!playlistId) {
          throw new Error('Playlist ID is required');
        }

        // Use our API route instead of direct YouTube API calls
        const response = await fetch(
          `/api/youtube/playlist?playlistId=${playlistId}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch YouTube playlist videos');
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        return data.videos || [];
      } catch (error) {
        console.error('Error fetching YouTube playlist videos:', error);
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
