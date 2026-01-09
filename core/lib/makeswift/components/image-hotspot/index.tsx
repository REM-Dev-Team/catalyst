'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

import { Image } from '~/components/image';

export interface HotspotData {
  id: string;
  x: number; // Percentage position (0-100)
  y: number; // Percentage position (0-100)
  title: string;
  content: string;
  image?: {
    src: string;
    alt: string;
  };
}

export interface ImageHotspotProps {
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  hotspots: HotspotData[];
  className?: string;
  showHotspots?: boolean;
}

export function ImageHotspot({
  image,
  hotspots,
  className,
  showHotspots = true,
}: ImageHotspotProps) {
  const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);

  const handleHotspotClick = (hotspot: HotspotData) => {
    setActiveHotspot(hotspot);
  };

  const handleCloseModal = () => {
    setActiveHotspot(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const displayHotspots = hotspots ?? [];

  return (
    <div className={clsx('relative w-full', className)}>
      {/* Main Image Container */}
      <div className="relative w-full">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width || 800}
          height={image.height || 600}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />

        {/* Hotspot Overlays - Always functional, visibility controlled by toggle */}
        {displayHotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className="group absolute z-10 cursor-pointer transition-all duration-300"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => handleHotspotClick(hotspot)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleHotspotClick(hotspot);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {/* Hotspot circle - visible only when toggle is ON */}
            {showHotspots && (
              <div className="relative">
                {/* Pulsing outer ring */}
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/30" />
                {/* Main hotspot button */}
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-600">
                  <div className="h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
            )}

            {/* Invisible clickable area - always present for functionality */}
            <div
              className="absolute h-12 w-12"
              style={{
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Tooltip label - only when hotspots are visible */}
            {showHotspots && (
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {hotspot.title}
                <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Modal - No Dark Overlay */}
      {activeHotspot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* No overlay background - completely transparent */}
          <div
            className="mx-3 my-10 max-h-[90%] max-w-2xl overflow-y-auto rounded-2xl shadow-xl"
            style={{ backgroundColor: '#d9d8d6' }}
          >
            <div className="flex flex-col">
              <div className="mb-2 flex min-h-10 flex-row items-center py-3 pl-5">
                <h1 className="flex-1 pr-4 font-body text-base font-semibold leading-none">
                  {activeHotspot.title}
                </h1>
                <div className="flex items-center justify-center pr-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-200"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mb-5 flex-1 px-5">
                <div className="space-y-4">
                  {activeHotspot.image?.src ? (
                    <div className="h-48 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-64">
                      <img
                        src={activeHotspot.image.src}
                        alt={activeHotspot.image.alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="whitespace-pre-line font-body leading-relaxed text-gray-700">
                    {activeHotspot.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
