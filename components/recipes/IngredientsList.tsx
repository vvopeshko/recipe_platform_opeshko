import { Ingredient } from '@/types';

interface IngredientsListProps {
  ingredients: Ingredient[];
}

export const IngredientsList: React.FC<IngredientsListProps> = ({ ingredients }) => {
  // Sort by order_index
  const sortedIngredients = [...ingredients].sort((a, b) => a.order_index - b.order_index);

  if (sortedIngredients.length === 0) {
    return <p className="text-gray-500">No ingredients listed.</p>;
  }

  return (
    <ul className="space-y-2">
      {sortedIngredients.map((ingredient) => {
        const quantity = ingredient.quantity || '';
        const unit = ingredient.unit || '';
        const quantityText = [quantity, unit].filter(Boolean).join(' ');
        
        return (
          <li key={ingredient.id} className="flex items-start gap-2">
            <span className="text-red-600 mt-1">•</span>
            <span className="flex-1">
              {quantityText && (
                <span className="font-medium text-gray-900">{quantityText} </span>
              )}
              <span className="text-gray-700">{ingredient.item}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};


