'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Debounce search - only update URL if we're on the home page
  useEffect(() => {
    // Only update URL if we're on the home page
    if (pathname !== '/') {
      return;
    }

    // Get current search param from URL
    const currentSearchParam = searchParams.get('search') || '';
    
    // Don't update if searchTerm matches the URL param
    if (searchTerm === currentSearchParam) {
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      router.push(`/?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, router, searchParams, pathname]);

  const clearSearch = () => {
    setSearchTerm('');
    // Only redirect if we're on the home page
    if (pathname === '/') {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        type="text"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

