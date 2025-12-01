import { Suspense } from 'react';
import { SearchBar } from './SearchBar';

export function SearchBarWrapper() {
  return (
    <Suspense fallback={<div className="flex-1 max-w-md h-10" />}>
      <SearchBar />
    </Suspense>
  );
}

