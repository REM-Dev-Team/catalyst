'use client';

import { clsx } from 'clsx';
import { Clock, Eye } from 'lucide-react';
import { useState } from 'react';

import { Modal } from '~/components/modal';
import { YouTubeVideo } from '~/lib/youtube/utils';

interface YouTubeVideoModalProps {
  video: YouTubeVideo;
  trigger?: React.ReactNode;
  className?: string;
}

export function YouTubeVideoModal({ video, trigger, className }: YouTubeVideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { title, description, publishedAt, viewCount, href } = video;

  // Extract video ID from href
  const patterns = [/[?&]v=([^&]+)/, /youtu\.be\/([^?]+)/];
  const match = patterns.map((pattern) => pattern.exec(href)).find((result) => result?.[1]);
  const videoId = match?.[1];

  if (!videoId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <Modal
      className={clsx(
        'w-full min-w-[320px] max-w-4xl bg-[#f8f8f2] font-[family-name:var(--card-font-family,var(--font-family-body))] sm:min-w-[480px]',
        className,
      )}
      isOpen={isOpen}
      setOpen={setIsOpen}
      title={title}
      trigger={trigger}
    >
      <div className="space-y-4">
        {/* Video Embed */}
        <div className="aspect-video w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-black">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full min-h-0 w-full min-w-0"
            src={embedUrl}
            title={title}
          />
        </div>

        {/* Video Info */}
        <div className="space-y-3">
          {description ? (
            <p className="text-contrast-600 line-clamp-3 text-sm">{description}</p>
          ) : null}

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
