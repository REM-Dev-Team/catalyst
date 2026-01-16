import { NextRequest, NextResponse } from 'next/server';

import { transformVideoItem, type YouTubeApiItem, YouTubeVideo } from '~/lib/youtube/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');
  const playlistId = searchParams.get('playlistId');
  const limit = searchParams.get('limit') || '6';
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  if (!channelId && !playlistId) {
    return NextResponse.json({ error: 'Channel ID or Playlist ID is required' }, { status: 400 });
  }

  try {
    let targetPlaylistId: string | null = playlistId;

    // If playlistId is provided, use it directly. Otherwise, get channel's uploads playlist
    if (!playlistId && channelId) {
      // First, get the channel's uploads playlist
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      );

      if (!channelResponse.ok) {
        throw new Error('Failed to fetch channel');
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const channelData = (await channelResponse.json()) as {
        items?: Array<{
          contentDetails?: {
            relatedPlaylists?: {
              uploads?: string;
            };
          };
        }>;
      };

      if (!channelData.items?.length) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }

      targetPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
    }

    // Extract playlist ID from URL if a full URL is provided
    if (
      targetPlaylistId &&
      (targetPlaylistId.includes('youtube.com/playlist') ||
        targetPlaylistId.includes('youtube.com/watch'))
    ) {
      const urlRegex = /[?&]list=([^&]+)/;
      const urlMatch = urlRegex.exec(targetPlaylistId);

      if (urlMatch?.[1]) {
        targetPlaylistId = urlMatch[1];
      } else {
        return NextResponse.json({ error: 'Invalid YouTube playlist URL' }, { status: 400 });
      }
    }

    // Get videos from the specified playlist
    const limitNum = parseInt(limit, 10);
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${targetPlaylistId}&maxResults=${limitNum}&key=${apiKey}`,
    );

    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch playlist');
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const playlistData = (await playlistResponse.json()) as {
      items?: Array<{
        snippet?: {
          resourceId?: {
            videoId?: string;
          };
        };
      }>;
    };

    if (!playlistData.items?.length) {
      return NextResponse.json({ videos: [] });
    }

    // Get video IDs
    const videoIds = playlistData.items
      .map((item) => item.snippet?.resourceId?.videoId)
      .filter((id): id is string => Boolean(id))
      .join(',');

    // Get detailed video information
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`,
    );

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const videosData = (await videosResponse.json()) as {
      items?: unknown[];
    };

    const videos: YouTubeVideo[] = (videosData.items ?? []).map((item) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return transformVideoItem(item as YouTubeApiItem);
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube API error:', error);

    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
