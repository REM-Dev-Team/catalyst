import { NextRequest, NextResponse } from 'next/server';
import { YouTubeVideo, transformVideoItem } from '~/lib/youtube/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistIdOrUrl = searchParams.get('playlistId');
  const limit = searchParams.get('limit') || '6';
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  if (!playlistIdOrUrl) {
    return NextResponse.json({ error: 'Playlist ID or URL is required' }, { status: 400 });
  }

  // Extract playlist ID from URL if a full URL is provided
  let playlistId = playlistIdOrUrl;
  if (playlistIdOrUrl.includes('youtube.com/playlist')) {
    const urlMatch = playlistIdOrUrl.match(/[?&]list=([^&]+)/);
    if (urlMatch && urlMatch[1]) {
      playlistId = urlMatch[1];
    } else {
      return NextResponse.json({ error: 'Invalid YouTube playlist URL' }, { status: 400 });
    }
  }

  try {
    // Get videos from the specified playlist
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${limit}&key=${apiKey}`
    );

    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch playlist');
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    // Get video IDs
    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

    // Get detailed video information
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`
    );

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    const videosData = await videosResponse.json();

    const videos: YouTubeVideo[] = videosData.items.map(transformVideoItem);

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist videos' }, { status: 500 });
  }
}
