'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { fetchRecipeById, fetchCategories, updateRecipe, uploadRecipeImage } from '@/lib/recipes';
import { useAuth } from '@/contexts/AuthContext';
import { Recipe, Category } from '@/types';

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const recipeId = params?.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch recipe and categories from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!recipeId) {
        setIsLoadingRecipe(false);
        return;
      }

      setIsLoadingRecipe(true);
      setError(null);

      try {
        // Load recipe and categories in parallel
        const [fetchedRecipe, fetchedCategories] = await Promise.all([
          fetchRecipeById(recipeId),
          fetchCategories(),
        ]);

        if (!fetchedRecipe) {
          setRecipe(null);
          setIsLoadingRecipe(false);
          return;
        }

        // Check if user is the owner
        if (user?.id !== fetchedRecipe.user_id) {
          setError('You do not have permission to edit this recipe.');
          setIsLoadingRecipe(false);
          return;
        }

        setRecipe(fetchedRecipe);
        setCategories(fetchedCategories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        })));
      } catch (err: any) {
        console.error('Error loading recipe:', err);
        setError(err.message || 'Failed to load recipe. Please try again.');
      } finally {
        setIsLoadingRecipe(false);
        setCategoriesLoading(false);
      }
    };

    loadData();
  }, [recipeId, user?.id]);

  if (isLoadingRecipe) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!recipe) {
    return (
      <ProtectedRoute>
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
      </ProtectedRoute>
    );
  }

  if (error && error.includes('permission')) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push(`/recipes/${recipeId}`)}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              View Recipe
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleSubmit = async (data: any) => {
    if (!user || !recipe) {
      setError('You must be logged in to edit recipes');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Upload image if a new one was provided
      let imageUrl = recipe.image_url; // Keep existing image by default
      
      if (data.image && data.image instanceof File) {
        try {
          imageUrl = await uploadRecipeImage(data.image, user.id);
        } catch (uploadError: any) {
          console.warn('Image upload failed, keeping existing image:', uploadError.message);
          // Keep existing image if upload fails
        }
      }

      // Update recipe in Supabase
      const updatedRecipe = await updateRecipe(
        recipeId,
        {
          title: data.title,
          description: data.description || undefined,
          image_url: imageUrl,
          category_id: data.category_id,
          prep_time: data.prep_time ? parseInt(data.prep_time) : undefined,
          cook_time: data.cook_time ? parseInt(data.cook_time) : undefined,
          servings: data.servings ? parseInt(data.servings) : undefined,
          difficulty: data.difficulty || undefined,
          ingredients: data.ingredients || [],
          steps: data.steps || [],
        },
        user.id
      );

      // Redirect to recipe detail page
      router.push(`/recipes/${recipeId}`);
    } catch (err: any) {
      console.error('Error updating recipe:', err);
      setError(err.message || 'Failed to update recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Recipe</h1>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            {categoriesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading categories...</p>
              </div>
            ) : (
              <RecipeForm
                initialData={recipe}
                categories={categories}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

