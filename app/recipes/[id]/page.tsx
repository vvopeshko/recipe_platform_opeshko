'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { RecipeDetail } from '@/components/recipes/RecipeDetail';
import { ConfirmModal } from '@/components/ui/Modal';
import { fetchRecipeById, getRecipesWithVotes } from '@/lib/recipes';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeWithCounts, Recipe } from '@/types';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const recipeId = params?.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeWithVotes, setRecipeWithVotes] = useState<RecipeWithCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch recipe from Supabase
  useEffect(() => {
    const loadRecipe = async () => {
      if (!recipeId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedRecipe = await fetchRecipeById(recipeId);
        
        if (!fetchedRecipe) {
          setRecipe(null);
          setIsLoading(false);
          return;
        }

        setRecipe(fetchedRecipe);
        
        // Get recipe with vote counts
        const recipesWithVoteCounts = await getRecipesWithVotes([fetchedRecipe], user?.id);
        setRecipeWithVotes(recipesWithVoteCounts[0] || null);
      } catch (error) {
        console.error('Error loading recipe:', error);
        setRecipe(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId, user?.id]);

  if (!recipeId || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe || !recipeWithVotes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h1>
          <p className="text-gray-600 mb-4">The recipe you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Go back to recipes
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === recipe.user_id;

  const handleVote = (recipeId: string, voteType: 'like' | 'dislike') => {
    // TODO: Implement voting with Supabase
    console.log(`Voting ${voteType} on recipe ${recipeId}`);
  };

  const getUserVote = (): 'like' | 'dislike' | null => {
    return recipeWithVotes.user_vote || null;
  };

  const handleDelete = async () => {
    // TODO: Implement delete with Supabase
    console.log('Deleting recipe:', recipeId);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecipeDetail
          recipe={recipeWithVotes}
          onVote={user ? handleVote : undefined}
          userVote={user ? getUserVote() : undefined}
          isOwner={isOwner}
          onEdit={isOwner ? () => router.push(`/recipes/${recipeId}/edit`) : undefined}
          onDelete={isOwner ? () => setShowDeleteModal(true) : undefined}
        />
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

