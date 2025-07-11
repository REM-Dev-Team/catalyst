'use client';

import {
  Checkbox,
  Group,
  Image,
  List,
  Number,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import { runtime } from '~/lib/makeswift/runtime';

interface Brand {
  imageSrc?: string;
  imageAlt: string;
  name: string;
}

interface MSBrandCarouselProps {
  className: string;
  brands?: Brand[];
  showScrollbar: boolean;
  showArrows: boolean;
  colorScheme: 'light' | 'dark';
  hideOverflow: boolean;
  logoHeightMobile: number;
  logoHeightDesktop: number;
}

runtime.registerComponent(
  function MSBrandCarousel({
    className,
    brands = [],
    showScrollbar = true,
    showArrows = true,
    colorScheme = 'light',
    hideOverflow = true,
    logoHeightMobile = 60,
    logoHeightDesktop = 60,
  }: MSBrandCarouselProps) {
    const defaultBrands = [
      { name: 'Remington', imageAlt: 'Remington logo', imageSrc: undefined },
      { name: 'Savage', imageAlt: 'Savage logo', imageSrc: undefined },
      { name: 'Aero Precision', imageAlt: 'Aero Precision logo', imageSrc: undefined },
      { name: 'Tikka', imageAlt: 'Tikka logo', imageSrc: undefined },
      { name: 'Howa', imageAlt: 'Howa logo', imageSrc: undefined },
      { name: 'Ruger', imageAlt: 'Ruger logo', imageSrc: undefined },
      { name: 'CZ', imageAlt: 'CZ logo', imageSrc: undefined },
    ];

    const displayBrands = brands.length > 0 ? brands : defaultBrands;

    return (
      <div className={className}>
        <style>{`
          .brand-logo {
            height: ${logoHeightMobile}px;
            transition: transform 0.2s ease-in-out;
          }
          .brand-logo:hover {
            transform: scale(1.2);
          }
          @media (min-width: 768px) {
            .brand-logo {
              height: ${logoHeightDesktop}px;
            }
          }
        `}</style>
        {displayBrands.length < 1 ? (
          <div className="p-4 text-center text-lg text-gray-400">Add brands to the carousel</div>
        ) : (
          <Carousel hideOverflow={hideOverflow}>
            <CarouselContent>
              {displayBrands.map((brand, index) => (
                <CarouselItem
                  className="basis-1/2 p-0 @md:basis-1/3 @lg:basis-1/4 @2xl:basis-1/6"
                  key={index}
                >
                  <div className="flex items-center justify-center p-0">
                    {brand.imageSrc ? (
                      <img
                        alt={brand.imageAlt}
                        className="brand-logo w-auto object-contain"
                        src={brand.imageSrc}
                      />
                    ) : (
                      <div className="brand-logo flex w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 text-sm font-medium text-gray-500">
                        {brand.name}
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {(showScrollbar || showArrows) && (
              <div className="flex w-full items-center justify-between">
                {showScrollbar && <CarouselScrollbar colorScheme={colorScheme} />}
                {showArrows && <CarouselButtons colorScheme={colorScheme} />}
              </div>
            )}
          </Carousel>
        )}
      </div>
    );
  },
  {
    type: 'brand-carousel',
    label: 'Brand Carousel',
    icon: 'carousel',
    props: {
      className: Style(),
      brands: List({
        label: 'Brands',
        type: Group({
          label: 'Brand',
          props: {
            imageSrc: Image({ label: 'Brand Logo' }),
            imageAlt: TextInput({ label: 'Image Alt Text', defaultValue: 'Brand logo' }),
            name: TextInput({ label: 'Brand Name', defaultValue: 'Brand Name' }),
          },
        }),
        getItemLabel: (item) => item?.name ?? 'Brand',
      }),
      logoHeightMobile: Number({
        label: 'Logo height (mobile, px)',
        defaultValue: 60,
        min: 20,
        max: 200,
        step: 5,
      }),
      logoHeightDesktop: Number({
        label: 'Logo height (desktop, px)',
        defaultValue: 60,
        min: 20,
        max: 200,
        step: 5,
      }),
      showScrollbar: Checkbox({
        label: 'Show scrollbar',
        defaultValue: true,
      }),
      showArrows: Checkbox({
        label: 'Show arrows',
        defaultValue: true,
      }),
      colorScheme: Select({
        label: 'Color scheme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'light',
      }),
      hideOverflow: Checkbox({
        label: 'Hide overflow',
        defaultValue: true,
      }),
    },
  },
);
