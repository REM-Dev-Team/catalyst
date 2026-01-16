'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { Pause, Play } from 'lucide-react';
import { ComponentPropsWithoutRef, useCallback, useEffect, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Image } from '~/components/image';

type ButtonLinkProps = ComponentPropsWithoutRef<typeof ButtonLink>;

interface Slide {
  title: string;
  secondTitle?: string;
  description?: string;
  showDescription?: boolean;
  image?: { alt: string; blurDataUrl?: string; src: string };
  cta?: {
    label: string;
    href: string;
    variant?: ButtonLinkProps['variant'];
    size?: ButtonLinkProps['size'];
    shape?: ButtonLinkProps['shape'];
  };
  showCta?: boolean;
  secondCta?: {
    label: string;
    href: string;
    variant?: ButtonLinkProps['variant'];
    size?: ButtonLinkProps['size'];
    shape?: ButtonLinkProps['shape'];
  };
  showSecondCta?: boolean;
  contentAlignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'center' | 'bottom';
}

interface Props {
  slides: Slide[];
  playOnInit?: boolean;
  interval?: number;
  className?: string;
}

interface UseProgressButtonType {
  selectedIndex: number;
  scrollSnaps: number[];
  onProgressButtonClick: (index: number) => void;
}

const useProgressButton = (
  emblaApi: EmblaCarouselType | undefined,
  onButtonClick?: (emblaApi: EmblaCarouselType) => void,
): UseProgressButtonType => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onProgressButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      if (onButtonClick) onButtonClick(emblaApi);
    },
    [emblaApi, onButtonClick],
  );

  const onInit = useCallback((emblaAPI: EmblaCarouselType) => {
    setScrollSnaps(emblaAPI.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaAPI: EmblaCarouselType) => {
    setSelectedIndex(emblaAPI.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);

    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onProgressButtonClick,
  };
};

// Helper function to check if a file is a video
function isVideoFile(src: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerSrc = src.toLowerCase();

  return videoExtensions.some((ext) => lowerSrc.includes(ext));
}

function SlideButtons({
  showCta,
  showSecondCta,
  cta,
  secondCta,
  contentAlignment,
}: {
  showCta: boolean;
  showSecondCta: boolean;
  cta?: Slide['cta'];
  secondCta?: Slide['secondCta'];
  contentAlignment?: 'left' | 'center' | 'right';
}) {
  if (!showCta && !showSecondCta) return null;

  return (
    <>
      <div
        className={clsx(
          'mt-0',
          contentAlignment === 'center' ? 'mx-auto' : contentAlignment === 'right' ? 'ml-auto' : '',
        )}
        style={{
          width: '170px',
          height: '2px',
          backgroundColor: '#ed1c24',
        }}
      />
      <div className="mt-6 flex flex-wrap gap-3 @xl:mt-8">
        {showCta && (
          <ButtonLink
            href={cta?.href ?? '#'}
            shape={cta?.shape ?? 'rounded'}
            size={cta?.size ?? 'x-small'}
            variant={cta?.variant ?? 'tertiary'}
          >
            {cta?.label ?? 'Learn more'}
          </ButtonLink>
        )}
        {showSecondCta && (
          <ButtonLink
            href={secondCta?.href ?? '#'}
            shape={secondCta?.shape ?? 'rounded'}
            size={secondCta?.size ?? 'x-small'}
            variant={secondCta?.variant ?? 'secondary'}
          >
            {secondCta?.label ?? 'Learn more'}
          </ButtonLink>
        )}
      </div>
    </>
  );
}

function SlideImage({ image, idx }: { image?: Slide['image']; idx: number }) {
  if (!image?.src || image.src === '') return null;

  // Check if the uploaded file is a video
  if (isVideoFile(image.src)) {
    return (
      <div className="relative h-full w-full">
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
        >
          <source src={image.src} type="video/mp4" />
          <source src={image.src} type="video/webm" />
          <source src={image.src} type="video/ogg" />
          {/* Fallback to image if video fails to load */}
          <Image
            alt={image.alt}
            blurDataURL={image.blurDataUrl}
            className="absolute inset-0 h-full w-full object-cover"
            fill
            placeholder={image.blurDataUrl != null && image.blurDataUrl !== '' ? 'blur' : 'empty'}
            priority={idx === 0}
            sizes="100vw"
            src={image.src}
          />
        </video>
      </div>
    );
  }

  // Regular image handling
  return (
    <div className="relative h-full w-full">
      <Image
        alt={image.alt}
        blurDataURL={image.blurDataUrl}
        className="absolute inset-0 h-full w-full object-cover"
        fill
        placeholder={image.blurDataUrl != null && image.blurDataUrl !== '' ? 'blur' : 'empty'}
        priority={idx === 0}
        sizes="100vw"
        src={image.src}
      />
    </div>
  );
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --slideshow-focus: hsl(var(--primary));
 *   --slideshow-mask: hsl(var(--foreground) / 80%);
 *   --slideshow-background: color-mix(in oklab, hsl(var(--primary)), black 75%);
 *   --slideshow-title: hsl(var(--background));
 *   --slideshow-title-font-family: var(--font-family-heading);
 *   --slideshow-description: hsl(var(--background) / 80%);
 *   --slideshow-description-font-family: var(--font-family-body);
 *   --slideshow-pagination: hsl(var(--background));
 *   --slideshow-play-border: hsl(var(--contrast-300) / 50%);
 *   --slideshow-play-border-hover: hsl(var(--contrast-300) / 80%);
 *   --slideshow-play-text: hsl(var(--background));
 *   --slideshow-number: hsl(var(--background));
 *   --slideshow-number-font-family: var(--font-family-mono);
 * }
 * ```
 */
export function Slideshow({ slides, playOnInit = true, interval = 5000, className }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 }, [
    Autoplay({ delay: interval, playOnInit }),
    Fade(),
  ]);
  const { selectedIndex, scrollSnaps, onProgressButtonClick } = useProgressButton(emblaApi);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;

    playOrStop();
  }, [emblaApi]);

  const resetAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    autoplay.reset();
  }, [emblaApi]);

  useEffect(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    setIsPlaying(autoplay.isPlaying());
    emblaApi
      .on('autoplay:play', () => {
        setIsPlaying(true);
        setPlayCount(playCount + 1);
      })
      .on('autoplay:stop', () => {
        setIsPlaying(false);
      })
      .on('reInit', () => {
        setIsPlaying(autoplay.isPlaying());
      });
  }, [emblaApi, playCount]);

  return (
    <section
      className={clsx(
        'relative h-[80vh] bg-[var(--slideshow-background,color-mix(in_oklab,hsl(var(--primary)),black_75%))] @container',
        className,
      )}
    >
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map(
            (
              {
                title,
                secondTitle,
                description,
                showDescription = true,
                image,
                cta,
                showCta = true,
                secondCta,
                showSecondCta = false,
                contentAlignment = 'left',
                verticalAlignment = 'center',
              },
              idx,
            ) => {
              return (
                <div
                  className="relative h-full w-full min-w-0 shrink-0 grow-0 basis-full"
                  key={idx}
                >
                  <SlideImage idx={idx} image={image} />
                  <div className="absolute inset-0 z-10">
                    <div
                      className="slideshow-content-responsive w-full text-balance"
                      style={
                        {
                          position: 'absolute',
                          top:
                            verticalAlignment === 'top'
                              ? 'var(--slideshow-top, 30px)'
                              : verticalAlignment === 'bottom'
                                ? 'auto'
                                : '50%',
                          bottom:
                            verticalAlignment === 'bottom'
                              ? 'var(--slideshow-bottom, 30px)'
                              : 'auto',
                          left:
                            contentAlignment === 'left'
                              ? '0'
                              : contentAlignment === 'right'
                                ? 'auto'
                                : '50%',
                          right: contentAlignment === 'right' ? '0' : 'auto',
                          transform:
                            verticalAlignment === 'center' && contentAlignment === 'center'
                              ? 'translate(-50%, -50%)'
                              : verticalAlignment === 'center'
                                ? 'translateY(-50%)'
                                : contentAlignment === 'center'
                                  ? 'translateX(-50%)'
                                  : 'none',
                          '--slideshow-top': '40px',
                          '--slideshow-bottom': '40px',
                        } as React.CSSProperties
                      }
                    >
                      <div
                        className={clsx(
                          'w-full flex-shrink-0',
                          contentAlignment === 'center'
                            ? 'text-center'
                            : contentAlignment === 'right'
                              ? 'text-right'
                              : 'text-left',
                        )}
                      >
                        <h1
                          className={clsx(
                            'slideshow-title futura-text m-0 font-bold leading-none text-[var(--slideshow-title,hsl(var(--background)))]',
                            contentAlignment === 'center'
                              ? 'w-full text-center'
                              : contentAlignment === 'right'
                                ? 'w-full text-right'
                                : 'w-full text-left',
                          )}
                          style={{
                            fontSize: '31px',
                            display: 'flex',
                            gap: '8px',
                            fontFamily: "'futura-pt', 'Futura', sans-serif",
                            fontWeight: 700,
                            justifyContent:
                              contentAlignment === 'center'
                                ? 'center'
                                : contentAlignment === 'right'
                                  ? 'flex-end'
                                  : 'flex-start',
                          }}
                        >
                          <span style={{ color: 'transparent' }}>{title}</span>
                        </h1>
                        {secondTitle ? (
                          <h2
                            className={clsx(
                              'slideshow-title mt-2 w-full font-[family-name:var(--slideshow-title-font-family,var(--font-family-heading))] font-bold leading-none text-[var(--slideshow-title,hsl(var(--background)))]',
                              contentAlignment === 'center'
                                ? 'text-center'
                                : contentAlignment === 'right'
                                  ? 'text-right'
                                  : 'text-left',
                            )}
                            style={{ fontSize: '31px' }}
                          >
                            {secondTitle}
                          </h2>
                        ) : null}
                        {showDescription ? (
                          <p
                            className={clsx(
                              'slideshow-description mb-6 mt-2 w-full font-[family-name:var(--slideshow-description-font-family,var(--font-family-body))] font-medium leading-normal text-[var(--slideshow-description,hsl(var(--background)/80%))]',
                              contentAlignment === 'center'
                                ? 'text-center'
                                : contentAlignment === 'right'
                                  ? 'text-right'
                                  : 'text-left',
                            )}
                            style={{ fontSize: '14px' }}
                          >
                            {description}
                          </p>
                        ) : null}
                        <div
                          className={clsx(
                            contentAlignment === 'center'
                              ? 'flex flex-col items-center'
                              : contentAlignment === 'right'
                                ? 'flex flex-col items-end'
                                : 'flex flex-col items-start',
                          )}
                        >
                          <SlideButtons
                            contentAlignment={contentAlignment}
                            cta={cta}
                            secondCta={secondCta}
                            showCta={showCta}
                            showSecondCta={showSecondCta}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 flex w-full max-w-screen-2xl -translate-x-1/2 flex-wrap items-center px-4 @xl:bottom-6 @xl:px-6 @4xl:px-8">
        {/* Progress Buttons */}
        {scrollSnaps.map((_: number, index: number) => {
          return (
            <button
              aria-label={`View image number ${index + 1}`}
              className="rounded-lg px-1.5 py-2 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--slideshow-focus,hsl(var(--primary)))]"
              key={index}
              onClick={() => {
                onProgressButtonClick(index);
                resetAutoplay();
              }}
            >
              <div className="relative overflow-hidden">
                {/* White Bar - Current Index Indicator / Progress Bar */}
                <div
                  className={clsx(
                    'absolute h-0.5 bg-[var(--slideshow-pagination,hsl(var(--background)))]',
                    'opacity-0 fill-mode-forwards',
                    isPlaying ? 'running' : 'paused',
                    index === selectedIndex
                      ? 'opacity-100 ease-linear animate-in slide-in-from-left'
                      : 'ease-out animate-out fade-out',
                  )}
                  key={`progress-${playCount}`} // Force the animation to restart when pressing "Play", to match animation with embla's autoplay timer
                  style={{
                    animationDuration: index === selectedIndex ? `${interval}ms` : '200ms',
                    width: `${150 / slides.length}px`,
                  }}
                />
                {/* Grey Bar BG */}
                <div
                  className="h-0.5 bg-[var(--slideshow-pagination,hsl(var(--background)))] opacity-30"
                  style={{ width: `${150 / slides.length}px` }}
                />
              </div>
            </button>
          );
        })}

        {/* Carousel Count - "01/03" */}
        <span className="ml-auto mr-3 mt-px font-[family-name:var(--slideshow-number-font-family,var(--font-family-mono))] text-sm text-[var(--slideshow-number,hsl(var(--background)))]">
          {selectedIndex + 1 < 10 ? `0${selectedIndex + 1}` : selectedIndex + 1}/
          {slides.length < 10 ? `0${slides.length}` : slides.length}
        </span>

        {/* Stop / Start Button */}
        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--slideshow-play-border,hsl(var(--contrast-300)/50%))] text-[var(--slideshow-play-text,hsl(var(--background)))] ring-[var(--slideshow-focus)] transition-opacity duration-300 hover:border-[var(--slideshow-play-border-hover,hsl(var(--contrast-300)/80%))] focus-visible:outline-0 focus-visible:ring-2"
          onClick={toggleAutoplay}
          type="button"
        >
          {isPlaying ? (
            <Pause className="pointer-events-none" size={16} strokeWidth={1.5} />
          ) : (
            <Play className="pointer-events-none" size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </section>
  );
}
