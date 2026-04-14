import { Slideshow, type SlideshowMobileAspectRatio } from '@/vibes/soul/sections/slideshow';

interface Slide {
  title: string;
  secondTitle: string;
  description: string;
  showDescription: boolean;
  imageSrc?: string;
  imageAlt: string;
  /**
   * When true, the red accent bar is hidden. Prefer this over legacy `showDivider` so “hide”
   * persists as `true` (Makeswift often omits `false` from saved props).
   */
  hideAccentLine?: boolean;
  /** Legacy Makeswift `showDivider: false` on saved pages; prefer `hideAccentLine`. */
  showDivider?: boolean;
  showButton: boolean;
  buttonLink?: { href?: string; target?: string };
  buttonText: string;
  buttonColor: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  showSecondButton: boolean;
  secondButtonLink?: { href?: string; target?: string };
  secondButtonText: string;
  secondButtonColor: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  contentAlignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
  imageHoldSeconds?: number;
}

interface MSAccordionsProps {
  className: string;
  slides: Slide[];
  autoplay: boolean;
  interval: number;
  mobileAspectRatio: SlideshowMobileAspectRatio;
}

export function MSSlideshow({
  className,
  slides,
  autoplay,
  interval,
  mobileAspectRatio,
}: MSAccordionsProps) {
  return (
    <Slideshow
      className={className}
      interval={interval * 1000}
      mobileAspectRatio={mobileAspectRatio}
      playOnInit={autoplay}
      slides={slides.map(
        ({
          title,
          secondTitle,
          description,
          showDescription,
          imageSrc,
          imageAlt,
          imageHoldSeconds,
          hideAccentLine,
          showDivider: legacyShowDivider,
          showButton,
          buttonLink,
          buttonText,
          buttonColor,
          showSecondButton,
          secondButtonLink,
          secondButtonText,
          secondButtonColor,
          contentAlignment,
          verticalAlignment,
        }) => {
          return {
            title,
            secondTitle: secondTitle || undefined,
            description,
            showDescription,
            image: imageSrc ? { alt: imageAlt, src: imageSrc } : undefined,
            holdDurationMs:
              (imageHoldSeconds ?? 0) > 0 ? Math.round((imageHoldSeconds ?? 0) * 1000) : undefined,
            showDivider: !(hideAccentLine === true || legacyShowDivider === false),
            showCta: showButton,
            cta: { label: buttonText, href: buttonLink?.href ?? '#', variant: buttonColor },
            showSecondCta: showSecondButton,
            secondCta: showSecondButton
              ? {
                  label: secondButtonText,
                  href: secondButtonLink?.href ?? '#',
                  variant: secondButtonColor,
                }
              : undefined,
            contentAlignment,
            verticalAlignment,
          };
        },
      )}
    />
  );
}
