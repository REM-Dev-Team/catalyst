'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
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
}

// Helper function to check if a file is a video
function isVideoFile(src: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerSrc = src.toLowerCase();

  return videoExtensions.some((ext) => lowerSrc.includes(ext));
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

function SlideButtons({
  showCta,
  showSecondCta,
  cta,
  secondCta,
}: {
  showCta: boolean;
  showSecondCta: boolean;
  cta?: Slide['cta'];
  secondCta?: Slide['secondCta'];
}) {
  if (!showCta && !showSecondCta) return null;

  return (
    <>
      <div
        className="mt-6 @xl:mt-8"
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

function SlideContent({ slide, idx }: { slide: Slide; idx: number }) {
  const {
    title,
    secondTitle,
    description,
    showDescription = true,
    image,
    cta,
    showCta = true,
    secondCta,
    showSecondCta = false,
  } = slide;

  return (
    <div className="relative h-full w-full min-w-0 shrink-0 grow-0 basis-full" key={idx}>
      <SlideImage idx={idx} image={image} />
      <div className="absolute inset-0 z-10">
        <div className="slideshow-content-padding flex h-full w-full items-center text-balance">
          <div className="w-full">
            <h1
              className="slideshow-title m-0 w-full font-[family-name:var(--slideshow-title-font-family,var(--font-family-heading))] font-bold leading-none text-[var(--slideshow-title,hsl(var(--background)))]"
              style={{ fontSize: '31px' }}
            >
              {title}
            </h1>
            {secondTitle ? (
              <h2
                className="slideshow-title mt-2 w-full font-[family-name:var(--slideshow-title-font-family,var(--font-family-heading))] font-bold leading-none text-[var(--slideshow-title,hsl(var(--background)))]"
                style={{ fontSize: '31px' }}
              >
                {secondTitle}
              </h2>
            ) : null}
            {showDescription ? (
              <p
                className="slideshow-description mt-2 w-full font-[family-name:var(--slideshow-description-font-family,var(--font-family-body))] font-medium leading-normal text-[var(--slideshow-description,hsl(var(--background)/80%))]"
                style={{ fontSize: '14px' }}
              >
                {description}
              </p>
            ) : null}
            <SlideButtons
              cta={cta}
              secondCta={secondCta}
              showCta={showCta}
              showSecondCta={showSecondCta}
            />
          </div>
        </div>
      </div>
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

  return (
    <section
      className={clsx(
        'slideshow-container relative bg-[var(--slideshow-background,color-mix(in_oklab,hsl(var(--primary)),black_75%))] @container',
        className,
      )}
      style={{
        aspectRatio: '1 / 1',
      }}
    >
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, idx) => (
            <SlideContent idx={idx} key={idx} slide={slide} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="slideshow-content-padding absolute bottom-4 left-0 right-0 flex w-full justify-center @xl:bottom-6">
        {/* Progress Dots */}
        {scrollSnaps.map((_: number, index: number) => (
          <button
            aria-label={`View image number ${index + 1}`}
            className="mx-1 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--slideshow-focus,hsl(var(--primary)))]"
            key={index}
            onClick={() => {
              onProgressButtonClick(index);
            }}
            type="button"
          >
            <span
              className={clsx(
                'inline-block h-3 w-3 rounded-full border-2 border-[var(--slideshow-pagination,hsl(var(--background)))] transition-all',
                index === selectedIndex
                  ? 'bg-transparent'
                  : 'bg-[var(--slideshow-pagination,hsl(var(--background)))]',
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
