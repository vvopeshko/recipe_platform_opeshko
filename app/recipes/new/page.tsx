'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { createRecipe, uploadRecipeImage, fetchCategories } from '@/lib/recipes';
import { Category } from '@/types';

export default function CreateRecipePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        })));
      } catch (err: any) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories. Please refresh the page.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (data: any) => {
    if (!user) {
      setError('You must be logged in to create a recipe');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Upload image if provided
      let imageUrl = '';
      
      if (data.image && data.image instanceof File) {
        try {
          imageUrl = await uploadRecipeImage(data.image, user.id);
        } catch (uploadError: any) {
          // If upload fails (e.g., bucket not configured), use placeholder
          console.warn('Image upload failed, using placeholder:', uploadError.message);
          imageUrl = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
          
          // Don't show error to user - recipe will still be created with placeholder
          // User can set up storage bucket later
        }
      } else {
        // Use placeholder if no image provided
        imageUrl = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
      }

      // Validate required fields
      if (!data.category_id) {
        throw new Error('Please select a category for your recipe.');
      }

      console.log('Creating recipe with data:', {
        title: data.title,
        category_id: data.category_id,
        userId: user.id,
        hasIngredients: (data.ingredients || []).length > 0,
        hasSteps: (data.steps || []).length > 0,
      });

      // Create recipe in Supabase
      const recipe = await createRecipe(
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

      // Redirect to the new recipe detail page
      router.push(`/recipes/${recipe.id}`);
    } catch (err: any) {
      console.error('Error creating recipe:', {
        error: err,
        message: err?.message,
        errorString: String(err),
      });
      
      // Extract meaningful error message
      const errorMessage = err?.message || 
                          (typeof err === 'string' ? err : '') ||
                          'Failed to create recipe. Please try again.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Recipe</h1>
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
              <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} categories={categories} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

