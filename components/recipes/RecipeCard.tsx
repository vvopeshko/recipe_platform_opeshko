import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users } from 'lucide-react';
import { RecipeWithCounts } from '@/types';
import { VoteButtons } from './VoteButtons';
import { Card } from '@/components/ui/Card';

interface RecipeCardProps {
  recipe: RecipeWithCounts;
  onVote?: (recipeId: string, voteType: 'like' | 'dislike') => void;
  userVote?: 'like' | 'dislike' | null;
  showActions?: boolean;
  onEdit?: (recipeId: string) => void;
  onDelete?: (recipeId: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onVote,
  userVote,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const authorName = recipe.profiles?.username || recipe.user_id;
  const categoryName = recipe.categories?.name || 'Uncategorized';
  
  return (
    <Card hover className="flex flex-col">
      <Link href={`/recipes/${recipe.id}`}>
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={recipe.image_url || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'}
            alt={recipe.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      </Link>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded">
            {categoryName}
          </span>
        </div>
        
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-600 transition-colors line-clamp-2">
            {recipe.title}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
          {recipe.description || 'No description available.'}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>By {authorName}</span>
          </div>
          {(recipe.prep_time || recipe.cook_time) && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {recipe.prep_time && recipe.cook_time
                  ? `${recipe.prep_time + recipe.cook_time}m`
                  : recipe.prep_time
                  ? `${recipe.prep_time}m`
                  : recipe.cook_time
                  ? `${recipe.cook_time}m`
                  : ''}
              </span>
            </div>
          )}
        </div>
        
        {onVote && (
          <div className="mt-auto pt-3 border-t border-gray-200">
            <VoteButtons
              recipeId={recipe.id}
              likes={recipe.like_count || 0}
              dislikes={recipe.dislike_count || 0}
              userVote={userVote}
              onVote={onVote}
            />
          </div>
        )}
        
        {showActions && (onEdit || onDelete) && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(recipe.id)}
                className="flex-1 text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(recipe.id)}
                className="flex-1 text-sm px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

