'use client';

import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

interface AgeVerificationProps {
  className?: string;
  title?: string;
  message?: string;
  yesLabel?: string;
  noLabel?: string;
  onVerified?: () => void;
  onRejected?: () => void;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --age-verification-overlay-background: hsl(var(--foreground) / 80%);
 *   --age-verification-background: hsl(var(--background));
 *   --age-verification-border: hsl(var(--foreground) / 10%);
 *   --age-verification-title-text: hsl(var(--foreground));
 *   --age-verification-title-font-family: var(--font-family-body);
 *   --age-verification-message-text: hsl(var(--contrast-500));
 *   --age-verification-message-font-family: var(--font-family-body);
 *   --age-verification-button-focus: hsl(var(--primary));
 * }
 * ```
 */
export function AgeVerification({
  className,
  title = 'Age Verification',
  message = 'You must be 18 or older to enter this site. Are you 18 or older?',
  yesLabel = 'Yes, I am 18+',
  noLabel = 'No, I am under 18',
  onVerified,
  onRejected,
}: AgeVerificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already verified their age
    const hasVerified = localStorage.getItem('age-verified');
    if (!hasVerified) {
      setIsVisible(true);
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem('age-verified', 'true');
    setIsVisible(false);
    onVerified?.();
  };

  const handleNo = () => {
    localStorage.setItem('age-verified', 'false');
    setIsVisible(false);
    onRejected?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--age-verification-overlay-background,hsl(var(--foreground)/80%))] @container">
      <div
        className={clsx(
          'mx-4 w-full max-w-md rounded-2xl bg-[var(--age-verification-background,hsl(var(--background)))] p-6 shadow-xl ring-1 ring-[var(--age-verification-border,hsl(var(--foreground)/10%))]',
          'transition ease-out',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          'font-[family-name:var(--font-family-futura)]',
          className,
        )}
      >
        <div className="mb-6 text-center">
          <h2 className="mb-3 text-xl font-semibold text-[var(--age-verification-title-text,hsl(var(--foreground)))]">
            {title}
          </h2>
          <p className="text-sm text-[var(--age-verification-message-text,hsl(var(--contrast-500)))]">
            {message}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="primary"
            size="medium"
            shape="rounded"
            className="flex-1 focus-visible:ring-[var(--age-verification-button-focus,hsl(var(--primary)))] [--button-primary-text:hsl(var(--background))]"
            onClick={handleYes}
          >
            {yesLabel}
          </Button>
          <Button
            variant="tertiary"
            size="medium"
            shape="rounded"
            className="flex-1 focus-visible:ring-[var(--age-verification-button-focus,hsl(var(--primary)))] [--button-tertiary-text:hsl(var(--background))]"
            onClick={handleNo}
          >
            {noLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
