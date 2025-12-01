export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Ingredient {
  id: string;
  item: string;
  quantity?: string;
  unit?: string;
  order_index: number;
}

export interface Step {
  id: string;
  step_number: number;
  instruction: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url: string;
  category_id: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
  categories?: {
    name: string;
    slug: string;
  };
  ingredients?: Ingredient[];
  steps?: Step[];
}

export interface RecipeVote {
  id: string;
  recipe_id: string;
  user_id: string;
  vote_type: 'like' | 'dislike';
}

export interface RecipeWithCounts extends Recipe {
  like_count?: number;
  dislike_count?: number;
  user_vote?: 'like' | 'dislike' | null;
}


