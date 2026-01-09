export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  href: string;
}

export function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  const match = patterns
    .map((pattern) => pattern.exec(url))
    .find((result) => result?.[1]);

  return match?.[1] ?? null;
}

export function formatDuration(duration: string): string {
  // Parse ISO 8601 duration format (PT4M13S -> 4:13)
  const durationRegex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const match = durationRegex.exec(duration);

  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export interface YouTubeApiItem {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
    };
  };
  contentDetails?: {
    duration?: string;
  };
  statistics?: {
    viewCount?: string;
  };
}

export function transformVideoItem(item: YouTubeApiItem): YouTubeVideo {
  const duration = formatDuration(item.contentDetails?.duration || '');
  const viewCount = parseInt(item.statistics?.viewCount || '0', 10).toLocaleString();

  return {
    id: item.id || '',
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
    publishedAt: item.snippet?.publishedAt || '',
    viewCount,
    duration,
    href: `https://www.youtube.com/watch?v=${item.id || ''}`,
  };
}
