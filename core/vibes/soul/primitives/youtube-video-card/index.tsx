import { clsx } from 'clsx';
import { Play, Eye, Clock } from 'lucide-react';

import { Image } from '~/components/image';
import { YouTubeVideo } from '~/lib/youtube/utils';
import { YouTubeVideoModal } from '~/lib/makeswift/components/youtube-video-modal';

interface Props {
  video: YouTubeVideo;
  className?: string;
}

export function YouTubeVideoCard({ video, className }: Props) {
  const { title, description, thumbnail, publishedAt, viewCount, duration } = video;

  const cardContent = (
    <div
      className={clsx(
        'group max-w-full rounded-b-lg rounded-t-2xl text-foreground ring-primary ring-offset-4 @container focus:outline-0 focus-visible:ring-2 font-[family-name:var(--card-font-family,var(--font-family-body))] cursor-pointer',
        className,
      )}
    >
      <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl bg-contrast-100">
        {thumbnail ? (
          <>
            <Image
              alt={title}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              fill
              sizes="(min-width: 80rem) 25vw, (min-width: 56rem) 33vw, (min-width: 28rem) 50vw, 100vw"
              src={thumbnail}
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/80 text-white transition-transform duration-300 group-hover:scale-110">
                <Play className="h-8 w-8 ml-1" fill="currentColor" />
              </div>
            </div>
            {/* Duration badge */}
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
              {duration}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-5xl font-bold leading-none tracking-tighter text-foreground/15">
            <Play className="h-16 w-16" />
          </div>
        )}
      </div>

      <div className="text-lg font-medium leading-snug line-clamp-2">{title}</div>
      <p className="mb-3 mt-1.5 line-clamp-2 text-sm font-normal text-contrast-400">{description}</p>
      
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
  );

  return (
    <YouTubeVideoModal video={video} trigger={cardContent} />
  );
}

export function YouTubeVideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('flex max-w-md animate-pulse flex-col gap-2 rounded-xl', className)}>
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden rounded-xl bg-contrast-100" />

      {/* Title */}
      <div className="h-4 w-24 rounded-lg bg-contrast-100" />

      {/* Description */}
      <div className="h-3 w-full rounded-lg bg-contrast-100" />
      <div className="h-3 w-2/3 rounded-lg bg-contrast-100" />

      {/* Meta info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-3 w-12 rounded bg-contrast-100" />
          <div className="h-3 w-16 rounded bg-contrast-100" />
        </div>
        <div className="h-3 w-20 rounded bg-contrast-100" />
      </div>
    </div>
  );
} 