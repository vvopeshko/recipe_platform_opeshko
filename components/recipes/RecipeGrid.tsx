import { RecipeWithCounts } from '@/types';
import { RecipeCard } from './RecipeCard';

interface RecipeGridProps {
  recipes: RecipeWithCounts[];
  onVote?: (recipeId: string, voteType: 'like' | 'dislike') => void;
  getUserVote?: (recipeId: string) => 'like' | 'dislike' | null;
  showActions?: boolean;
  onEdit?: (recipeId: string) => void;
  onDelete?: (recipeId: string) => void;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  onVote,
  getUserVote,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No recipes found.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onVote={onVote}
          userVote={getUserVote ? getUserVote(recipe.id) : undefined}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};


