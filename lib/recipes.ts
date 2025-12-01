// Recipe Service Functions for Supabase

import { supabase } from './supabase';
import { Recipe, Ingredient, Step, RecipeWithCounts } from '@/types';

// Fetch all recipes with filters
export const fetchRecipes = async (options?: {
  searchTerm?: string;
  categoryId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<Recipe[]> => {
  try {
    // First, get the recipes
    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by category
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    // Filter by user
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    // Apply limit and offset for pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset || 0) + (options.limit || 10) - 1);
    }

    const { data: recipesData, error: recipesError } = await query;

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      throw new Error(recipesError.message || 'Failed to fetch recipes');
    }

    if (!recipesData || recipesData.length === 0) {
      return [];
    }

    // Get unique user IDs and category IDs
    const userIds = [...new Set(recipesData.map((r: any) => r.user_id))];
    const categoryIds = [...new Set(recipesData.map((r: any) => r.category_id))];

    // Fetch profiles and categories in parallel
    const [profilesResult, categoriesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds),
      supabase
        .from('categories')
        .select('id, name, slug')
        .in('id', categoryIds),
    ]);

    // Create lookup maps
    const profilesMap = new Map(
      (profilesResult.data || []).map((p: any) => [p.id, { username: p.username, avatar_url: p.avatar_url }])
    );
    const categoriesMap = new Map(
      (categoriesResult.data || []).map((c: any) => [c.id, { id: c.id, name: c.name, slug: c.slug }])
    );

    // Transform the data to match our Recipe type
    let recipes = recipesData.map((recipe: any) => ({
      id: recipe.id,
      user_id: recipe.user_id,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.image_url,
      category_id: recipe.category_id,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty as 'Easy' | 'Medium' | 'Hard',
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
      profiles: profilesMap.get(recipe.user_id),
      categories: categoriesMap.get(recipe.category_id),
    }));

    // Apply search filter if provided (client-side for now)
    if (options?.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      recipes = recipes.filter((recipe) => {
        const titleMatch = recipe.title.toLowerCase().includes(term);
        const descMatch = recipe.description?.toLowerCase().includes(term);
        return titleMatch || descMatch;
      });
    }

    return recipes;
  } catch (error: any) {
    console.error('Error in fetchRecipes:', error);
    throw error;
  }
};

// Fetch a single recipe by ID with ingredients and steps
export const fetchRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    // Fetch recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (recipeError) {
      console.error('Error fetching recipe:', recipeError);
      return null;
    }

    if (!recipeData) {
      return null;
    }

    // Fetch related data in parallel (use Promise.allSettled to handle missing data gracefully)
    const [profileResult, categoryResult, ingredientsResult, stepsResult] = await Promise.allSettled([
      supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', recipeData.user_id)
        .single(),
      supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', recipeData.category_id)
        .single(),
      supabase
        .from('ingredients')
        .select('*')
        .eq('recipe_id', id)
        .order('order_index', { ascending: true }),
      supabase
        .from('steps')
        .select('*')
        .eq('recipe_id', id)
        .order('step_number', { ascending: true }),
    ]);

    // Extract data from Promise.allSettled results
    const profileData = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
    const categoryData = categoryResult.status === 'fulfilled' ? categoryResult.value.data : null;
    const ingredientsData = ingredientsResult.status === 'fulfilled' ? ingredientsResult.value.data : [];
    const stepsData = stepsResult.status === 'fulfilled' ? stepsResult.value.data : [];

    // Combine all data
    const recipe: Recipe = {
      id: recipeData.id,
      user_id: recipeData.user_id,
      title: recipeData.title,
      description: recipeData.description,
      image_url: recipeData.image_url,
      category_id: recipeData.category_id,
      prep_time: recipeData.prep_time,
      cook_time: recipeData.cook_time,
      servings: recipeData.servings,
      difficulty: recipeData.difficulty as 'Easy' | 'Medium' | 'Hard',
      created_at: recipeData.created_at,
      updated_at: recipeData.updated_at,
      profiles: profileData ? {
        username: profileData.username,
        avatar_url: profileData.avatar_url,
      } : undefined,
      categories: categoryData ? {
        name: categoryData.name,
        slug: categoryData.slug,
      } : undefined,
      ingredients: (ingredientsData || []).map((ing: any) => ({
        id: ing.id,
        item: ing.item,
        quantity: ing.quantity,
        unit: ing.unit,
        order_index: ing.order_index,
      })),
      steps: (stepsData || []).map((step: any) => ({
        id: step.id,
        step_number: step.step_number,
        instruction: step.instruction,
      })),
    };

    return recipe;
  } catch (error: any) {
    console.error('Error in fetchRecipeById:', error);
    return null;
  }
};

// Create a new recipe
export const createRecipe = async (
  recipeData: {
    title: string;
    description?: string;
    image_url: string;
    category_id: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    ingredients: Array<{
      item: string;
      quantity?: string;
      unit?: string;
    }>;
    steps: Array<{
      instruction: string;
    }>;
  },
  userId: string
): Promise<Recipe> => {
  try {
    // Step 1: Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        title: recipeData.title,
        description: recipeData.description || null,
        image_url: recipeData.image_url,
        category_id: recipeData.category_id,
        prep_time: recipeData.prep_time || null,
        cook_time: recipeData.cook_time || null,
        servings: recipeData.servings || null,
        difficulty: recipeData.difficulty || null,
      })
      .select()
      .single();

    if (recipeError) {
      // Extract error message properly
      const errorMessage = recipeError.message || 
                          (typeof recipeError === 'string' ? recipeError : '') ||
                          JSON.stringify(recipeError) ||
                          'Unknown error creating recipe';
      
      console.error('Error creating recipe:', {
        error: recipeError,
        message: errorMessage,
        code: recipeError.code,
        details: recipeError.details,
        hint: recipeError.hint,
      });
      
      throw new Error(`Failed to create recipe: ${errorMessage}`);
    }

    if (!recipe) {
      throw new Error('Failed to create recipe');
    }

    const recipeId = recipe.id;

    // Step 2: Insert ingredients
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      const ingredientsToInsert = recipeData.ingredients.map((ing, index) => ({
        recipe_id: recipeId,
        item: ing.item,
        quantity: ing.quantity || null,
        unit: ing.unit || null,
        order_index: index,
      }));

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        console.error('Error creating ingredients:', ingredientsError);
        // Don't throw - recipe is already created, we can continue
      }
    }

    // Step 3: Insert steps
    if (recipeData.steps && recipeData.steps.length > 0) {
      const stepsToInsert = recipeData.steps.map((step, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        instruction: step.instruction,
      }));

      const { error: stepsError } = await supabase
        .from('steps')
        .insert(stepsToInsert);

      if (stepsError) {
        console.error('Error creating steps:', stepsError);
        // Don't throw - recipe is already created, we can continue
      }
    }

    // Fetch the complete recipe with all relations
    const completeRecipe = await fetchRecipeById(recipeId);
    if (!completeRecipe) {
      throw new Error('Failed to fetch created recipe');
    }

    return completeRecipe;
  } catch (error: any) {
    console.error('Error in createRecipe:', {
      error,
      message: error?.message,
      errorString: String(error),
      errorJson: JSON.stringify(error, null, 2),
    });
    
    // Throw a user-friendly error message
    const errorMessage = error?.message || 
                        (typeof error === 'string' ? error : '') ||
                        'Failed to create recipe. Please check your input and try again.';
    throw new Error(errorMessage);
  }
};

// Upload image to Supabase Storage
export const uploadRecipeImage = async (file: File, userId: string): Promise<string> => {
  const BUCKET_NAME = 'recipe-images';
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('Uploading image to storage:', {
      bucket: BUCKET_NAME,
      path: filePath,
      fileSize: file.size,
      fileType: file.type,
    });

    // Try to upload directly (bucket listing may fail due to permissions, but upload should work)
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      // Extract error message in multiple ways
      const errorMessage = uploadError.message || 
                          (typeof uploadError === 'string' ? uploadError : '') ||
                          'Unknown storage error';
      
      console.error('Storage upload error:', {
        error: uploadError,
        message: errorMessage,
        statusCode: (uploadError as any).statusCode,
        name: (uploadError as any).name,
      });

      // Provide more specific error messages
      const errorStr = errorMessage.toLowerCase();
      if (errorStr.includes('bucket not found') || errorStr.includes('does not exist') || (uploadError as any).statusCode === '404') {
        throw new Error(`Storage bucket "${BUCKET_NAME}" not found (404). Please verify:
1. The bucket exists in Supabase Dashboard → Storage
2. The bucket name is exactly "${BUCKET_NAME}" (case-sensitive)
3. The bucket is set to "Public"`);
      }
      
      if (errorStr.includes('policy') || errorStr.includes('permission') || errorStr.includes('forbidden')) {
        throw new Error(`Permission denied. Please check storage policies:
1. Go to Storage → Policies → ${BUCKET_NAME}
2. Create an INSERT policy for authenticated users`);
      }

      throw new Error(`Failed to upload image: ${errorMessage}`);
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);

    return publicUrl;
  } catch (error: any) {
    console.error('Error in uploadRecipeImage:', error);
    throw error;
  }
};

// Get recipes with vote counts
export const getRecipesWithVotes = async (
  recipes: Recipe[],
  userId?: string
): Promise<RecipeWithCounts[]> => {
  try {
    const recipeIds = recipes.map((r) => r.id);

    if (recipeIds.length === 0) {
      return recipes.map((r) => ({
        ...r,
        like_count: 0,
        dislike_count: 0,
        user_vote: null,
      }));
    }

    // Fetch vote counts for all recipes
    const { data: votesData, error: votesError } = await supabase
      .from('recipe_votes')
      .select('recipe_id, vote_type, user_id')
      .in('recipe_id', recipeIds);

    if (votesError) {
      console.error('Error fetching votes:', votesError);
      // Continue with zero votes
    }

    // Calculate vote counts per recipe
    const voteCounts = new Map<string, { likes: number; dislikes: number; userVote: 'like' | 'dislike' | null }>();

    (votesData || []).forEach((vote: any) => {
      const recipeId = vote.recipe_id;
      if (!voteCounts.has(recipeId)) {
        voteCounts.set(recipeId, { likes: 0, dislikes: 0, userVote: null });
      }

      const counts = voteCounts.get(recipeId)!;
      if (vote.vote_type === 'like') {
        counts.likes++;
      } else if (vote.vote_type === 'dislike') {
        counts.dislikes++;
      }

      // Check if this is the current user's vote
      if (userId && vote.user_id === userId) {
        counts.userVote = vote.vote_type;
      }
    });

    // Combine recipes with vote counts
    return recipes.map((recipe) => {
      const counts = voteCounts.get(recipe.id) || { likes: 0, dislikes: 0, userVote: null };
      return {
        ...recipe,
        like_count: counts.likes,
        dislike_count: counts.dislikes,
        user_vote: counts.userVote,
      };
    });
  } catch (error: any) {
    console.error('Error in getRecipesWithVotes:', error);
    // Return recipes without vote counts on error
    return recipes.map((r) => ({
      ...r,
      like_count: 0,
      dislike_count: 0,
      user_vote: null,
    }));
  }
};

// Update an existing recipe
export const updateRecipe = async (
  recipeId: string,
  recipeData: {
    title: string;
    description?: string;
    image_url: string;
    category_id: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    ingredients: Array<{
      item: string;
      quantity?: string;
      unit?: string;
    }>;
    steps: Array<{
      instruction: string;
    }>;
  },
  userId: string
): Promise<Recipe> => {
  try {
    // Verify recipe ownership
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', recipeId)
      .single();

    if (fetchError || !existingRecipe) {
      throw new Error('Recipe not found');
    }

    if (existingRecipe.user_id !== userId) {
      throw new Error('You do not have permission to update this recipe');
    }

    // Step 1: Update recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .update({
        title: recipeData.title,
        description: recipeData.description || null,
        image_url: recipeData.image_url,
        category_id: recipeData.category_id,
        prep_time: recipeData.prep_time || null,
        cook_time: recipeData.cook_time || null,
        servings: recipeData.servings || null,
        difficulty: recipeData.difficulty || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recipeId)
      .select()
      .single();

    if (recipeError) {
      console.error('Error updating recipe:', recipeError);
      throw new Error(recipeError.message || 'Failed to update recipe');
    }

    if (!recipe) {
      throw new Error('Failed to update recipe');
    }

    // Step 2: Delete existing ingredients and steps
    await Promise.all([
      supabase.from('ingredients').delete().eq('recipe_id', recipeId),
      supabase.from('steps').delete().eq('recipe_id', recipeId),
    ]);

    // Step 3: Insert new ingredients
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      const ingredientsToInsert = recipeData.ingredients.map((ing, index) => ({
        recipe_id: recipeId,
        item: ing.item,
        quantity: ing.quantity || null,
        unit: ing.unit || null,
        order_index: index,
      }));

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        console.error('Error updating ingredients:', ingredientsError);
        // Don't throw - recipe is already updated
      }
    }

    // Step 4: Insert new steps
    if (recipeData.steps && recipeData.steps.length > 0) {
      const stepsToInsert = recipeData.steps.map((step, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        instruction: step.instruction,
      }));

      const { error: stepsError } = await supabase
        .from('steps')
        .insert(stepsToInsert);

      if (stepsError) {
        console.error('Error updating steps:', stepsError);
        // Don't throw - recipe is already updated
      }
    }

    // Fetch the complete updated recipe
    const completeRecipe = await fetchRecipeById(recipeId);
    if (!completeRecipe) {
      throw new Error('Failed to fetch updated recipe');
    }

    return completeRecipe;
  } catch (error: any) {
    console.error('Error in updateRecipe:', error);
    throw error;
  }
};

// Delete a recipe
export const deleteRecipe = async (recipeId: string, userId: string): Promise<void> => {
  try {
    // First verify the recipe belongs to the user
    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', recipeId)
      .single();

    if (fetchError) {
      throw new Error('Recipe not found');
    }

    if (recipe.user_id !== userId) {
      throw new Error('You do not have permission to delete this recipe');
    }

    // Delete the recipe (cascade will delete ingredients and steps)
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (deleteError) {
      console.error('Error deleting recipe:', deleteError);
      throw deleteError;
    }
  } catch (error: any) {
    console.error('Error in deleteRecipe:', error);
    throw error;
  }
};

// Fetch categories
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in fetchCategories:', error);
    throw error;
  }
};

