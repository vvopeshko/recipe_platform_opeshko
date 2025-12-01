import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, ChefHat, Edit, Trash2 } from 'lucide-react';
import { RecipeWithCounts } from '@/types';
import { VoteButtons } from './VoteButtons';
import { IngredientsList } from './IngredientsList';
import { StepsList } from './StepsList';
import { Button } from '@/components/ui/Button';

interface RecipeDetailProps {
  recipe: RecipeWithCounts;
  onVote?: (recipeId: string, voteType: 'like' | 'dislike') => void;
  userVote?: 'like' | 'dislike' | null;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onVote,
  userVote,
  isOwner = false,
  onEdit,
  onDelete,
}) => {
  const authorName = recipe.profiles?.username || recipe.user_id;
  const categoryName = recipe.categories?.name || 'Uncategorized';
  const totalTime =
    (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Image */}
      <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden">
        <Image
          src={recipe.image_url || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded">
                {categoryName}
              </span>
              {recipe.difficulty && (
                <span className="inline-block px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded">
                  {recipe.difficulty}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            <p className="text-gray-600 mb-4">{recipe.description || 'No description available.'}</p>
          </div>
          {isOwner && (onEdit || onDelete) && (
            <div className="flex gap-2">
              {onEdit && (
                <Link href={`/recipes/${recipe.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              )}
              {onDelete && (
                <Button variant="danger" size="sm" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            <span>By {authorName}</span>
          </div>
          {recipe.prep_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Prep: {recipe.prep_time}m</span>
            </div>
          )}
          {recipe.cook_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Cook: {recipe.cook_time}m</span>
            </div>
          )}
          {totalTime > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Total: {totalTime}m</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>

        {/* Vote Buttons */}
        {onVote && (
          <div className="mb-8 pb-6 border-b border-gray-200">
            <VoteButtons
              recipeId={recipe.id}
              likes={recipe.like_count || 0}
              dislikes={recipe.dislike_count || 0}
              userVote={userVote}
              onVote={onVote}
            />
          </div>
        )}
      </div>

      {/* Ingredients */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <IngredientsList ingredients={recipe.ingredients} />
        ) : (
          <p className="text-gray-500">No ingredients listed.</p>
        )}
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
        {recipe.steps && recipe.steps.length > 0 ? (
          <StepsList steps={recipe.steps} />
        ) : (
          <p className="text-gray-500">No steps listed.</p>
        )}
      </div>
    </div>
  );
};

