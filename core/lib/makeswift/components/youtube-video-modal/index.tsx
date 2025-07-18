'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Play, Eye, Clock } from 'lucide-react';

import { Modal } from '~/components/modal';
import { YouTubeVideo } from '~/lib/youtube/utils';

interface YouTubeVideoModalProps {
  video: YouTubeVideo;
  trigger?: React.ReactNode;
  className?: string;
}

export function YouTubeVideoModal({ video, trigger, className }: YouTubeVideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { title, description, thumbnail, publishedAt, viewCount, duration, href } = video;

  // Extract video ID from href
  const videoId = href.match(/[?&]v=([^&]+)/)?.[1] || href.match(/youtu\.be\/([^?]+)/)?.[1];

  if (!videoId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <Modal
      className={clsx('w-full max-w-4xl min-w-[320px] sm:min-w-[480px] font-[family-name:var(--card-font-family,var(--font-family-body))] bg-[#f8f8f2]', className)}
      isOpen={isOpen}
      setOpen={setIsOpen}
      title={title}
      trigger={trigger}
    >
      <div className="space-y-4">
        {/* Video Embed */}
        <div className="w-full aspect-video max-w-full min-w-0 overflow-hidden rounded-xl bg-black">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full min-h-0 min-w-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video Info */}
        <div className="space-y-3">
          {description && (
            <p className="text-sm text-contrast-600 line-clamp-3">{description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-contrast-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
} 