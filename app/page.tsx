'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RecipeGrid } from '@/components/recipes/RecipeGrid';
import { fetchRecipes, getRecipesWithVotes } from '@/lib/recipes';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeWithCounts, Recipe } from '@/types';

function HomeContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const searchTerm = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesWithVotes, setRecipesWithVotes] = useState<RecipeWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipes from Supabase
  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedRecipes = await fetchRecipes({
          categoryId: categoryId || undefined,
          searchTerm: searchTerm || undefined,
        });
        
        setRecipes(fetchedRecipes);
        
        // Get recipes with vote counts
        const recipesWithVoteCounts = await getRecipesWithVotes(fetchedRecipes, user?.id);
        setRecipesWithVotes(recipesWithVoteCounts);
      } catch (err: any) {
        console.error('Error loading recipes:', err);
        setError(err.message || 'Failed to load recipes');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [searchTerm, categoryId, user?.id]);

  const handleVote = (recipeId: string, voteType: 'like' | 'dislike') => {
    // TODO: Implement voting with Supabase
    console.log(`Voting ${voteType} on recipe ${recipeId}`);
  };

  const getUserVote = (recipeId: string): 'like' | 'dislike' | null => {
    const recipe = recipesWithVotes.find((r) => r.id === recipeId);
    return recipe?.user_vote || null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Recipes</h1>
          <p className="text-gray-600">
            {recipesWithVotes.length} recipe{recipesWithVotes.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <RecipeGrid
          recipes={recipesWithVotes}
          onVote={user ? handleVote : undefined}
          getUserVote={user ? getUserVote : undefined}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipes...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
