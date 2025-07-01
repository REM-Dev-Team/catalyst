'use client';

import { useEffect, useRef, useState } from 'react';
import { Style, TextInput } from '@makeswift/runtime/controls';
import { clsx } from 'clsx';

import { runtime } from '~/lib/makeswift/runtime';

interface MakeswiftSubscribeProps {
  className?: string;
  formId: string;
  ctctM: string;
}

function MakeswiftSubscribe({
  className,
  formId,
  ctctM,
}: MakeswiftSubscribeProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any)._ctct_m = ctctM;
    }

    const loadConstantContactForm = () => {
      if (!formRef.current) return;

      formRef.current.innerHTML = '';

      const embedDiv = document.createElement('div');
      embedDiv.className = 'ctct-inline-form';
      embedDiv.setAttribute('data-form-id', formId);
      
      formRef.current.appendChild(embedDiv);

      const existingScript = document.getElementById('signupScript');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = 'signupScript';
      script.src = 'https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsLoaded(true);
        setError('');
      };

      script.onerror = () => {
        setError('Unable to load subscription form. Please try again later.');
      };

      document.head.appendChild(script);
    };

    const timer = setTimeout(loadConstantContactForm, 100);

    return () => {
      clearTimeout(timer);
      const script = document.getElementById('signupScript');
      if (script) {
        script.remove();
      }
    };
  }, [formId, ctctM]);

  if (error) {
    return (
      <div className={clsx('space-y-3', className)}>
        <div className="p-4 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      <div ref={formRef} />
      
      {!isLoaded && (
        <div className="p-4 text-center text-gray-600 bg-gray-50 rounded-xl border border-gray-200">
          Loading subscription form...
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
      defaultValue: '99935d66-4680-44a3-811e-df4f2ac65db1'
    }),
    ctctM: TextInput({ 
      label: 'Constant Contact _ctct_m value', 
      defaultValue: 'f270aeecce6a8e6100a678ebfbe8b6e5'
    }),
  },
}); 