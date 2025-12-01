'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useOptimistic, useTransition } from 'react';

import { Select } from '@/vibes/soul/form/select';

export interface Option {
  label: string;
  value: string;
}

export function Sorting({
  label,
  options,
  paramName = 'sort',
  defaultValue = '',
  placeholder,
}: {
  label?: string | null;
  options: Option[];
  paramName?: string;
  defaultValue?: string;
  placeholder?: string | null;
}) {
  const [param, setParam] = useQueryState(
    paramName,
    parseAsString.withDefault(defaultValue).withOptions({ shallow: false, history: 'push' }),
  );
  const [optimisticParam, setOptimisticParam] = useOptimistic(param);
  const [isPending, startTransition] = useTransition();
  const resolvedLabel = label ?? 'Sort';
  const resolvedPlaceholder = placeholder ?? 'Sort by';

  return (
    <Select
      hideLabel
      label={resolvedLabel}
      name={paramName}
      onValueChange={(value) => {
        startTransition(async () => {
          setOptimisticParam(value);
          await setParam(value);
        });
      }}
      options={options}
      pending={isPending}
      placeholder={resolvedPlaceholder}
      value={optimisticParam}
      variant="rectangle"
    />
  );
}

export function SortingSkeleton() {
  return <div className="h-[50px] w-[12ch] animate-pulse rounded-full bg-contrast-100" />;
}
