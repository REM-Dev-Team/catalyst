'use client';

import { Style, TextInput } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';

import { runtime } from '~/lib/makeswift/runtime';

import { YouTubeVideoModal } from './index';

interface MakeswiftYouTubeVideoModalProps {
  className?: string;
  videoUrl: string;
  triggerText?: string;
}

function MakeswiftYouTubeVideoModal({
  className,
  videoUrl,
  triggerText = 'Watch Video',
}: MakeswiftYouTubeVideoModalProps) {
  // For now, this component will just show a button that opens the modal
  // In a real implementation, you'd want to fetch the video data from the URL
  // This is a simplified version - you might want to enhance it based on your needs

  const mockVideo = {
    id: 'mock-id',
    title: 'YouTube Video',
    description: 'Click to watch the video',
    thumbnail: '',
    publishedAt: new Date().toISOString(),
    viewCount: '0',
    duration: '0:00',
    href: videoUrl,
  };

  return (
    <div className={clsx('w-full', className)}>
      <YouTubeVideoModal
        trigger={
          <button className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90">
            {triggerText}
          </button>
        }
        video={mockVideo}
      />
    </div>
  );
}

runtime.registerComponent(MakeswiftYouTubeVideoModal, {
  type: 'youtube-video-modal',
  label: 'Content / YouTube Video Modal',
  props: {
    className: Style(),
    videoUrl: TextInput({
      label: 'YouTube Video URL',
      defaultValue: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }),
    triggerText: TextInput({
      label: 'Trigger Button Text',
      defaultValue: 'Watch Video',
    }),
  },
});
