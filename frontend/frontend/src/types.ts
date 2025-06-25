export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  fridgeType: 'Ngăn mát' | 'Tủ đông';
  location: string;
  quantity: number;
  registerDate: string;
  expiryDate: string;
  note: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  addedBy: string;
  addedAt: string;
  status: 'pending' | 'bought';
  priority?: 'low' | 'medium' | 'high';
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string[];
  image?: string;
}

export interface MealPlan {
  id: number;
  date: string;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
  };
} 