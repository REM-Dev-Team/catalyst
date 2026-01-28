'use client';

import { Link, Style, TextInput } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { runtime } from '~/lib/makeswift/runtime';

interface MakeswiftSubscribeProps {
  className?: string;
  ctctM: string;
  link: { href?: string; target?: string };
  buttonText: string;
}

/**
 * Constant Contact: pop-up only (no inline widget).
 * Loads the CC script and sets _ctct_m so pop-up forms (e.g. exit-intent) work.
 * Renders a button linking to your newsletter page (no widget form).
 */
function MakeswiftSubscribe({ className, ctctM, link, buttonText }: MakeswiftSubscribeProps) {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Pop-up only: set _ctct_m and load script. No widget form is rendered.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, no-underscore-dangle, @typescript-eslint/consistent-type-assertions
    (window as any)._ctct_m = ctctM;

    const existingScript = document.querySelector(
      'script[src*="signup-form-widget.min.js"]',
    );

    if (existingScript || scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      return;
    }

    // Same script Constant Contact uses for pop-ups; we do not render any widget.
    const script = document.createElement('script');
    script.id = 'signupScript';
    script.src =
      'https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount so popup keeps working when navigating
    };
  }, [ctctM]);

  return (
    <div className={clsx('w-fit', className)}>
      <ButtonLink
        className="uppercase"
        href={link.href ?? '#'}
        shape="rounded"
        size="medium"
        target={link.target}
        variant="primary"
      >
        {buttonText}
      </ButtonLink>
    </div>
  );
}

runtime.registerComponent(MakeswiftSubscribe, {
  type: 'constant-contact-subscribe',
  label: 'Marketing / Newsletter Subscribe',
  props: {
    className: Style({ properties: [Style.Margin] }),
    ctctM: TextInput({
      label: 'Constant Contact _ctct_m value (required for pop-up forms)',
      defaultValue: 'f270aeecce6a8e6100a678ebfbe8b6e5',
    }),
    link: Link({
      label: 'Newsletter page link',
    }),
    buttonText: TextInput({
      label: 'Button text',
      defaultValue: 'Subscribe to newsletter',
    }),
  },
});

export default MakeswiftSubscribe;
