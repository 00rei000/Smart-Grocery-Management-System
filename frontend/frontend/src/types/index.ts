// Inventory Types
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  location: string;
  category?: string;
}

// Shopping List Types
export interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  priority: 'low' | 'medium' | 'high';
  isPurchased: boolean;
}

// Recipe Types
export interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: {
    quantity: number;
    unit: string;
    name: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string[];
  image?: string;
}

// Meal Plan Types
export interface MealPlan {
  id: number;
  date: string;
  meals: {
    [key in 'breakfast' | 'lunch' | 'dinner']?: Recipe;
  };
}

// Common Types
export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type Unit = {
  id: number;
  name: string;
  abbreviation: string;
}; 