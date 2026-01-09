import { NextRequest, NextResponse } from 'next/server';
import {
  extractVideoId,
  transformVideoItem,
  type YouTubeApiItem,
  YouTubeVideo,
} from '~/lib/youtube/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('videoUrl');
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  if (!videoUrl) {
    return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
  }

  try {
    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Fetch video details from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const data = (await response.json()) as {
      items?: unknown[];
    };

    if (!data.items?.length) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const item = data.items[0] as YouTubeApiItem;
    const video: YouTubeVideo = transformVideoItem(item);

    return NextResponse.json({ video });
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}
