'use client';

import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createSerializer, parseAsString } from 'nuqs';

import { Link } from '~/components/link';

export interface CursorPaginationInfo {
  startCursorParamName?: string;
  startCursor?: string | null;
  endCursorParamName?: string;
  endCursor?: string | null;
}

interface Props {
  label?: string | null;
  info: CursorPaginationInfo;
  previousLabel?: string | null;
  nextLabel?: string | null;
  scroll?: boolean;
}

export function CursorPagination({
  label,
  info,
  previousLabel,
  nextLabel,
  scroll,
}: Props) {
  const resolvedLabel = label ?? 'pagination';
  const {
    startCursorParamName = 'before',
    endCursorParamName = 'after',
    startCursor,
    endCursor,
  } = info;
  const searchParams = useSearchParams();
  const serialize = createSerializer({
    [startCursorParamName]: parseAsString,
    [endCursorParamName]: parseAsString,
  });
  const resolvedPreviousLabel = previousLabel ?? 'Go to previous page';
  const resolvedNextLabel = nextLabel ?? 'Go to next page';

  return (
    <nav aria-label={resolvedLabel} className="py-10" role="navigation">
      <ul className="flex items-center justify-center gap-3">
        <li>
          {startCursor != null ? (
            <PaginationLink
              aria-label={resolvedPreviousLabel}
              href={serialize(searchParams, {
                [startCursorParamName]: startCursor,
                [endCursorParamName]: null,
              })}
              scroll={scroll}
            >
              <ArrowLeft size={24} strokeWidth={1} />
            </PaginationLink>
          ) : (
            <SkeletonLink>
              <ArrowLeft size={24} strokeWidth={1} />
            </SkeletonLink>
          )}
        </li>
        <li>
          {endCursor != null ? (
            <PaginationLink
              aria-label={resolvedNextLabel}
              href={serialize(searchParams, {
                [endCursorParamName]: endCursor,
                [startCursorParamName]: null,
              })}
              scroll={scroll}
            >
              <ArrowRight size={24} strokeWidth={1} />
            </PaginationLink>
          ) : (
            <SkeletonLink>
              <ArrowRight size={24} strokeWidth={1} />
            </SkeletonLink>
          )}
        </li>
      </ul>
    </nav>
  );
}

function PaginationLink({
  href,
  children,
  scroll,
  'aria-label': ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  scroll?: boolean;
  ['aria-label']?: string;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className={clsx(
        'flex h-12 w-12 items-center justify-center rounded-full border border-contrast-100 text-foreground ring-primary transition-colors duration-300 hover:border-contrast-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2',
      )}
      href={href}
      scroll={scroll}
    >
      {children}
    </Link>
  );
}

function SkeletonLink({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full border border-contrast-100 text-foreground opacity-50 duration-300">
      {children}
    </div>
  );
}

export function CursorPaginationSkeleton() {
  return (
    <div className="flex w-full justify-center bg-background py-10 text-xs">
      <div className="flex gap-2">
        <SkeletonLink>
          <ArrowLeft />
        </SkeletonLink>
        <SkeletonLink>
          <ArrowRight />
        </SkeletonLink>
      </div>
    </div>
  );
}
