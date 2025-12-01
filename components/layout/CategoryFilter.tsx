'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';
import { Select } from '@/components/ui/Select';

export const CategoryFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';

  const handleCategoryChange = (categoryId: string) => {
    // Only update URL if we're on the home page, otherwise navigate to home with filter
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    
    // Always redirect to home page with category filter
    router.push(`/?${params.toString()}`);
  };

  const options = [
    { value: '', label: 'All Categories' },
    ...CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <div className="min-w-[180px]">
      <Select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        options={options}
        className="w-full"
      />
    </div>
  );
};

