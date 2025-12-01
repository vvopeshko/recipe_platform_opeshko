import { Recipe, Category, User } from '@/types';
import { CATEGORIES } from './constants';

export const MOCK_USERS: User[] = [
  { id: '1', email: 'chef@example.com', username: 'ChefMaster' },
  { id: '2', email: 'baker@example.com', username: 'SweetBaker' },
  { id: '3', email: 'cook@example.com', username: 'HomeCook' },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Classic Chocolate Chip Cookies',
    description: 'Soft and chewy chocolate chip cookies that are perfect for any occasion. These cookies are crispy on the edges and soft in the middle.',
    image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
    category_id: '4',
    prep_time: 15,
    cook_time: 10,
    servings: 24,
    difficulty: 'Easy',
    created_at: '2024-01-17T10:00:00.000Z',
    updated_at: '2024-01-17T10:00:00.000Z',
    profiles: { username: 'ChefMaster' },
    categories: { name: 'Desserts', slug: 'desserts' },
    ingredients: [
      { id: '1', item: 'All-purpose flour', quantity: '2.25', unit: 'cup', order_index: 0 },
      { id: '2', item: 'Butter', quantity: '1', unit: 'cup', order_index: 1 },
      { id: '3', item: 'Brown sugar', quantity: '0.75', unit: 'cup', order_index: 2 },
      { id: '4', item: 'White sugar', quantity: '0.75', unit: 'cup', order_index: 3 },
      { id: '5', item: 'Eggs', quantity: '2', unit: 'piece', order_index: 4 },
      { id: '6', item: 'Vanilla extract', quantity: '2', unit: 'tsp', order_index: 5 },
      { id: '7', item: 'Chocolate chips', quantity: '2', unit: 'cup', order_index: 6 },
    ],
    steps: [
      { id: '1', step_number: 1, instruction: 'Preheat oven to 375°F (190°C).' },
      { id: '2', step_number: 2, instruction: 'Cream together butter and both sugars until smooth.' },
      { id: '3', step_number: 3, instruction: 'Beat in eggs one at a time, then stir in vanilla.' },
      { id: '4', step_number: 4, instruction: 'Gradually blend in flour mixture.' },
      { id: '5', step_number: 5, instruction: 'Stir in chocolate chips.' },
      { id: '6', step_number: 6, instruction: 'Drop rounded tablespoons onto ungreased cookie sheets.' },
      { id: '7', step_number: 7, instruction: 'Bake for 9-11 minutes or until golden brown.' },
    ],
  },
  {
    id: '2',
    user_id: '2',
    title: 'Avocado Toast with Poached Eggs',
    description: 'A healthy and delicious breakfast option that combines creamy avocado with perfectly poached eggs on toasted bread.',
    image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800',
    category_id: '1',
    prep_time: 5,
    cook_time: 10,
    servings: 2,
    difficulty: 'Medium',
    created_at: '2024-01-16T10:00:00.000Z',
    updated_at: '2024-01-16T10:00:00.000Z',
    profiles: { username: 'SweetBaker' },
    categories: { name: 'Breakfast', slug: 'breakfast' },
    ingredients: [
      { id: '8', item: 'Sourdough bread', quantity: '2', unit: 'slice', order_index: 0 },
      { id: '9', item: 'Avocado', quantity: '1', unit: 'piece', order_index: 1 },
      { id: '10', item: 'Eggs', quantity: '2', unit: 'piece', order_index: 2 },
      { id: '11', item: 'Lemon juice', quantity: '1', unit: 'tsp', order_index: 3 },
      { id: '12', item: 'Salt', quantity: '1', unit: 'pinch', order_index: 4 },
      { id: '13', item: 'Black pepper', quantity: '1', unit: 'pinch', order_index: 5 },
      { id: '14', item: 'Red pepper flakes', quantity: '1', unit: 'pinch', order_index: 6 },
    ],
    steps: [
      { id: '8', step_number: 1, instruction: 'Toast the bread until golden brown.' },
      { id: '9', step_number: 2, instruction: 'Mash the avocado with lemon juice, salt, and pepper.' },
      { id: '10', step_number: 3, instruction: 'Poach the eggs in simmering water for 3-4 minutes.' },
      { id: '11', step_number: 4, instruction: 'Spread avocado mixture on toast.' },
      { id: '12', step_number: 5, instruction: 'Top with poached eggs and red pepper flakes.' },
    ],
  },
  {
    id: '3',
    user_id: '3',
    title: 'Creamy Tomato Basil Pasta',
    description: 'A simple yet elegant pasta dish with a rich tomato cream sauce and fresh basil. Perfect for a weeknight dinner.',
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    category_id: '3',
    prep_time: 10,
    cook_time: 20,
    servings: 4,
    difficulty: 'Easy',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-15T10:00:00.000Z',
    profiles: { username: 'HomeCook' },
    categories: { name: 'Dinner', slug: 'dinner' },
    ingredients: [
      { id: '15', item: 'Penne pasta', quantity: '1', unit: 'lb', order_index: 0 },
      { id: '16', item: 'Olive oil', quantity: '2', unit: 'tbsp', order_index: 1 },
      { id: '17', item: 'Garlic', quantity: '3', unit: 'clove', order_index: 2 },
      { id: '18', item: 'Crushed tomatoes', quantity: '1', unit: 'can', order_index: 3 },
      { id: '19', item: 'Heavy cream', quantity: '0.5', unit: 'cup', order_index: 4 },
      { id: '20', item: 'Fresh basil', quantity: '0.5', unit: 'cup', order_index: 5 },
      { id: '21', item: 'Parmesan cheese', quantity: '0.5', unit: 'cup', order_index: 6 },
    ],
    steps: [
      { id: '13', step_number: 1, instruction: 'Cook pasta according to package directions.' },
      { id: '14', step_number: 2, instruction: 'Heat olive oil in a large pan over medium heat.' },
      { id: '15', step_number: 3, instruction: 'Add garlic and cook until fragrant, about 1 minute.' },
      { id: '16', step_number: 4, instruction: 'Add crushed tomatoes and simmer for 10 minutes.' },
      { id: '17', step_number: 5, instruction: 'Stir in heavy cream and bring to a gentle simmer.' },
      { id: '18', step_number: 6, instruction: 'Toss with cooked pasta, basil, and parmesan.' },
    ],
  },
];

export const MOCK_VOTES: Record<string, { likes: number; dislikes: number; userVote?: 'like' | 'dislike' }> = {
  '1': { likes: 24, dislikes: 2 },
  '2': { likes: 18, dislikes: 1 },
  '3': { likes: 31, dislikes: 0 },
};

// Helper function to get recipes with vote counts
export const getRecipesWithVotes = (recipes: Recipe[], userId?: string): any[] => {
  return recipes.map((recipe) => ({
    ...recipe,
    like_count: MOCK_VOTES[recipe.id]?.likes || 0,
    dislike_count: MOCK_VOTES[recipe.id]?.dislikes || 0,
    user_vote: userId ? MOCK_VOTES[recipe.id]?.userVote : null,
  }));
};

