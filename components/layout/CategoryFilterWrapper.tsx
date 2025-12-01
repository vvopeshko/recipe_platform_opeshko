import { Suspense } from 'react';
import { CategoryFilter } from './CategoryFilter';

export function CategoryFilterWrapper() {
  return (
    <Suspense fallback={<div className="min-w-[180px] h-10" />}>
      <CategoryFilter />
    </Suspense>
  );
}

