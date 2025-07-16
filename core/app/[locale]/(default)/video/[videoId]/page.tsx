import { notFound } from 'next/navigation';

import { BackButton } from './back-button';

interface VideoPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;

  if (!videoId) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Video player */}
          <div className="relative w-full overflow-hidden rounded-lg bg-black shadow-lg">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
              src={`https://youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
            />
          </div>

          {/* Close button */}
          <div className="mt-6 text-center">
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  );
} 