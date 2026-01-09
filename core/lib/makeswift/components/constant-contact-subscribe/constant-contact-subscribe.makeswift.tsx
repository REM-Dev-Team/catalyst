'use client';

import { Style, TextInput } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';

import { runtime } from '~/lib/makeswift/runtime';

interface MakeswiftSubscribeProps {
  className?: string;
  formId: string;
  ctctM: string;
}

function MakeswiftSubscribe({ className, formId, ctctM }: MakeswiftSubscribeProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const retryCountRef = useRef(0);
  const isLoadedRef = useRef(false);
  const maxRetries = 3;

  // Check if form is actually rendered in DOM
  const checkFormRendered = useCallback(() => {
    if (!formRef.current) return false;

    // Look for Constant Contact form elements
    const formElements = formRef.current.querySelectorAll('form, input, button, .ctct-inline-form');

    return formElements.length > 0;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, no-underscore-dangle, @typescript-eslint/consistent-type-assertions
      (window as any)._ctct_m = ctctM;
    }

    const loadConstantContactForm = () => {
      if (!formRef.current) {
        setError('Form container not found');

        return;
      }

      // Check if form is already rendered
      if (checkFormRendered()) {
        setIsLoaded(true);

        return;
      }

      formRef.current.innerHTML = '';

      // Create embed div
      const embedDiv = document.createElement('div');

      embedDiv.className = 'ctct-inline-form';
      embedDiv.setAttribute('data-form-id', formId);

      formRef.current.appendChild(embedDiv);

      // Check if script is already loaded globally
      const existingGlobalScript = document.querySelector(
        'script[src*="signup-form-widget.min.js"]',
      );

      if (existingGlobalScript) {
        setTimeout(() => {
          if (checkFormRendered()) {
            setIsLoaded(true);
            setError('');
          } else {
            setTimeout(loadConstantContactForm, 1000);
          }
        }, 1000);

        return;
      }

      // Create and load script
      const script = document.createElement('script');

      script.id = `signupScript-${formId}`;
      script.src =
        'https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js';
      script.async = true;
      script.defer = true;

      // Add timeout for script loading
      const timeoutId = setTimeout(() => {
        if (!isLoadedRef.current) {
          script.onerror?.(new Event('timeout'));
        }
      }, 15000);

      script.onload = () => {
        clearTimeout(timeoutId);
        // Give the script time to initialize the form
        setTimeout(() => {
          if (checkFormRendered()) {
            setIsLoaded(true);
            isLoadedRef.current = true;
            setError('');
            setRetryCount(0);
            scriptRef.current = script;
          } else if (retryCountRef.current < maxRetries) {
            const nextRetry = retryCountRef.current + 1;

            retryCountRef.current = nextRetry;
            setRetryCount(nextRetry);
            setTimeout(loadConstantContactForm, 1000 * nextRetry);
          } else {
            setError('Form failed to load. Please try refreshing the page.');
          }
        }, 3000);
      };

      script.onerror = () => {
        if (retryCountRef.current < maxRetries) {
          const nextRetry = retryCountRef.current + 1;

          retryCountRef.current = nextRetry;
          setRetryCount(nextRetry);
          setTimeout(loadConstantContactForm, 1000 * nextRetry);
        } else {
          setError('Unable to load subscription form. Please try refreshing the page.');
        }
      };

      document.head.appendChild(script);
    };

    // Use requestAnimationFrame for better timing
    const loadTimer = requestAnimationFrame(() => {
      setTimeout(loadConstantContactForm, 500);
    });

    return () => {
      cancelAnimationFrame(loadTimer);
    };
  }, [formId, ctctM, checkFormRendered, maxRetries]);

  if (error) {
    return (
      <div className={clsx('space-y-3', className)}>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
          {error}
          {retryCount > 0 && (
            <div className="mt-2 text-sm">
              Retrying... ({retryCount}/{maxRetries})
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      <div ref={formRef} />

      {!isLoaded && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-gray-600">
          {retryCount > 0
            ? `Loading subscription form... (Attempt ${retryCount + 1})`
            : 'Loading subscription form...'}
        </div>
      )}
    </div>
  );
}

runtime.registerComponent(MakeswiftSubscribe, {
  type: 'constant-contact-subscribe',
  label: 'Marketing / Newsletter Subscribe',
  props: {
    className: Style(),
    formId: TextInput({
      label: 'Constant Contact Form ID',
      defaultValue: '99935d66-4680-44a3-811e-df4f2ac65db1',
    }),
    ctctM: TextInput({
      label: 'Constant Contact _ctct_m value',
      defaultValue: 'f270aeecce6a8e6100a678ebfbe8b6e5',
    }),
  },
});

export default MakeswiftSubscribe;
