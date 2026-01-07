import { clsx } from 'clsx';

import { Badge } from '@/vibes/soul/primitives/badge';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Rating } from '@/vibes/soul/primitives/rating';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { Compare } from './compare';

export interface Product {
  id: string;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  subtitle?: string;
  badge?: string;
  rating?: number;
  numberOfReviews?: number;
  inventoryMessage?: string;
}

export interface ProductCardProps {
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1' | '4:3';
  showCompare?: boolean;
  imagePriority?: boolean;
  imageSizes?: string;
  compareLabel?: string;
  compareParamName?: string;
  product: Product;
  mobileLayout?: 'portrait' | 'landscape';
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-card-focus: hsl(var(--primary));
 *   --product-card-light-offset: hsl(var(--background));
 *   --product-card-light-background: hsl(var(--contrast-100));
 *   --product-card-light-title: hsl(var(--foreground));
 *   --product-card-light-subtitle: hsl(var(--foreground) / 75%);
 *   --product-card-dark-offset: hsl(var(--foreground));
 *   --product-card-dark-background: hsl(var(--contrast-500));
 *   --product-card-dark-title: hsl(var(--background));
 *   --product-card-dark-subtitle: hsl(var(--background) / 75%);
 *   --product-card-font-family: var(--font-family-body);
 * }
 * ```
 */
export function ProductCard({
  product: { id, title, subtitle, badge, price, image, href, rating },
  colorScheme = 'light',
  className,
  showCompare = false,
  aspectRatio = '4:3',
  compareLabel,
  compareParamName,
  imagePriority = false,
  imageSizes = '(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw',
  mobileLayout = 'portrait',
}: ProductCardProps) {
  const isMobileLandscape = mobileLayout === 'landscape';

  return (
    <article
      className={clsx(
        'group flex min-w-0 max-w-md font-[family-name:var(--card-font-family,var(--font-family-body))] @container',
        isMobileLandscape ? 'flex-row gap-3 xl:flex-col xl:gap-2' : 'flex-col gap-2',
        className,
      )}
      data-product-valid="true"
    >
      <div className={clsx(
        'relative',
        isMobileLandscape ? 'w-24 shrink-0 xl:w-full' : 'w-full'
      )}>
        <div
          className={clsx(
            'relative overflow-hidden rounded-xl @md:rounded-2xl',
            isMobileLandscape
              ? 'aspect-square xl:aspect-[4/3]'
              : {
                  '5:6': 'aspect-[5/6]',
                  '3:4': 'aspect-[3/4]',
                  '1:1': 'aspect-square',
                  '4:3': 'aspect-[4/3]',
                }[aspectRatio],
            {
              light: 'bg-[var(--product-card-light-background,hsl(var(--contrast-100)))]',
              dark: 'bg-[var(--product-card-dark-background,hsl(var(--contrast-500)))]',
            }[colorScheme],
          )}
        >
          {image != null ? (
            <Image
              alt={image.alt}
              className={clsx(
                'w-full scale-100 select-none object-cover transition-transform duration-500 ease-out group-hover:scale-110',
                {
                  light: 'bg-[var(--product-card-light-background,hsl(var(--contrast-100))]',
                  dark: 'bg-[var(--product-card-dark-background,hsl(var(--contrast-500))]',
                }[colorScheme],
              )}
              fill
              priority={imagePriority}
              sizes={imageSizes}
              src={image.src}
            />
          ) : (
            <div
              className={clsx(
                'absolute inset-0 flex items-center justify-center break-words p-4 text-base font-bold leading-tight tracking-tighter opacity-25 transition-transform duration-500 ease-out group-hover:scale-105 @xs:text-lg',
                {
                  light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
                  dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
                }[colorScheme],
              )}
            >
              {title}
            </div>
          )}
          {badge != null && badge !== '' && (
            <Badge className="absolute left-3 top-3" shape="rounded">
              {badge}
            </Badge>
          )}
        </div>
        <Link
          aria-label={title}
          className={clsx(
            'absolute inset-0 rounded-b-lg rounded-t-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--product-card-focus,hsl(var(--primary)))] focus-visible:ring-offset-4',
            {
              light: 'ring-offset-[var(--product-card-light-offset,hsl(var(--background)))]',
              dark: 'ring-offset-[var(--product-card-dark-offset,hsl(var(--foreground)))]',
            }[colorScheme],
          )}
          href={href}
          id={id}
        >
          <span className="sr-only">View product</span>
        </Link>
      </div>

      {/* Mobile Landscape: Column 2 - Title (only on mobile when landscape) */}
      {isMobileLandscape && (
        <div className="flex-1 flex flex-col justify-start min-w-0 xl:hidden">
          <span
            className={clsx(
              'block font-semibold uppercase text-sm',
              {
                light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
                dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
              }[colorScheme],
            )}
          >
            {title}
          </span>
          {subtitle != null && subtitle !== '' && (
            <span
              className={clsx(
                'block text-xs font-normal',
                {
                  light: 'text-[var(--product-card-light-subtitle,hsl(var(--foreground)/75%))]',
                  dark: 'text-[var(--product-card-dark-subtitle,hsl(var(--background)/75%))]',
                }[colorScheme],
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Mobile Landscape: Column 3 - Price, Rating, Button (only on mobile when landscape) */}
      {isMobileLandscape && (
        <div className="flex flex-col justify-center items-end gap-2 shrink-0 xl:hidden">
          {price != null && <PriceLabel colorScheme={colorScheme} price={price} />}
          {rating != null && (
            <div>
              <Rating rating={rating} showRating={false} />
            </div>
          )}
          <ButtonLink
            className="!border-[#ED1C24] !bg-[#ED1C24] !text-white hover:!bg-[#ED1C24]/90"
            href={href}
            shape="rounded"
            size="x-small"
            variant="primary"
          >
            Shop Now
          </ButtonLink>
        </div>
      )}

      {/* Desktop/Portrait Layout */}
      <div className={clsx(
        'mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @2xl:flex-row',
        isMobileLandscape && 'hidden xl:flex'
      )}>
        <div className="flex-1 text-sm @[16rem]:text-base">
          <span
            className={clsx(
              'block font-semibold uppercase',
              {
                light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
                dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
              }[colorScheme],
            )}
          >
            {title}
          </span>

          {subtitle != null && subtitle !== '' && (
            <span
              className={clsx(
                'block text-sm font-normal',
                {
                  light: 'text-[var(--product-card-light-subtitle,hsl(var(--foreground)/75%))]',
                  dark: 'text-[var(--product-card-dark-subtitle,hsl(var(--background)/75%))]',
                }[colorScheme],
              )}
            >
              {subtitle}
            </span>
          )}
          {price != null && <PriceLabel colorScheme={colorScheme} price={price} />}
        </div>
      </div>
      {/* Desktop/Portrait: Compare or Rating/Button */}
      <div className={clsx(
        isMobileLandscape && 'hidden xl:block'
      )}>
        {showCompare ? (
          <div className="mt-0.5 shrink-0">
            <Compare
              colorScheme={colorScheme}
              label={compareLabel}
              paramName={compareParamName}
              product={{ id, title, href, image }}
            />
          </div>
        ) : (
          <div className="mt-0.5 shrink-0 space-y-4 pb-4">
            {rating != null && (
              <div>
                <Rating rating={rating} showRating={false} />
              </div>
            )}
            <div className="flex justify-center">
              <ButtonLink
                className="!border-[#ED1C24] !bg-[#ED1C24] !text-white hover:!bg-[#ED1C24]/90"
                href={href}
                shape="rounded"
                size="x-small"
                variant="primary"
              >
                Shop Now
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton({
  className,
  aspectRatio = '4:3',
}: Pick<ProductCardProps, 'className' | 'aspectRatio'>) {
  return (
    <Skeleton.Root className={clsx(className)}>
      <Skeleton.Box
        className={clsx(
          'rounded-[var(--product-card-border-radius,1rem)]',
            {
              '5:6': 'aspect-[5/6]',
              '3:4': 'aspect-[3/4]',
              '1:1': 'aspect-square',
              '4:3': 'aspect-[4/3]',
            }[aspectRatio],
        )}
      />
      <div className="mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @xs:flex-row">
        <div className="flex-1 text-sm @[16rem]:text-base">
          <Skeleton.Text characterCount={10} className="rounded" />
          <Skeleton.Text characterCount={8} className="rounded" />
          <Skeleton.Text characterCount={6} className="rounded" />
        </div>
      </div>
    </Skeleton.Root>
  );
}
