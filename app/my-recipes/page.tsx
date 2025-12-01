'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { RecipeGrid } from '@/components/recipes/RecipeGrid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ConfirmModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fetchRecipes, getRecipesWithVotes, deleteRecipe } from '@/lib/recipes';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeWithCounts, Recipe } from '@/types';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function MyRecipesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesWithVotes, setRecipesWithVotes] = useState<RecipeWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user's recipes from Supabase
  useEffect(() => {
    const loadRecipes = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedRecipes = await fetchRecipes({
          userId: user.id,
        });
        
        setRecipes(fetchedRecipes);
        
        // Get recipes with vote counts
        const recipesWithVoteCounts = await getRecipesWithVotes(fetchedRecipes, user.id);
        setRecipesWithVotes(recipesWithVoteCounts);
      } catch (err: any) {
        console.error('Error loading recipes:', err);
        setError(err.message || 'Failed to load recipes');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [user?.id]);

  const handleEdit = (recipeId: string) => {
    router.push(`/recipes/${recipeId}/edit`);
  };

  const handleDelete = (recipeId: string) => {
    setRecipeToDelete(recipeId);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete || !user?.id) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRecipe(recipeToDelete, user.id);
      
      // Remove deleted recipe from state
      setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete));
      setRecipesWithVotes((prev) => prev.filter((r) => r.id !== recipeToDelete));
      
      setRecipeToDelete(null);
    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      alert(err.message || 'Failed to delete recipe. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your recipes...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">Error: {error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (recipesWithVotes.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
              <Link href="/recipes/new">
                <Button variant="primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Recipe
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">You haven't created any recipes yet.</p>
              <Link href="/recipes/new">
                <Button variant="primary">Create Your First Recipe</Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
            <Link href="/recipes/new">
              <Button variant="primary">
                <Plus className="w-5 h-5 mr-2" />
                Create Recipe
              </Button>
            </Link>
          </div>
          <RecipeGrid
            recipes={recipesWithVotes}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <ConfirmModal
          isOpen={!!recipeToDelete}
          onClose={() => setRecipeToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete Recipe"
          message="Are you sure you want to delete this recipe? This action cannot be undone."
          confirmText={isDeleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </ProtectedRoute>
  );
}

