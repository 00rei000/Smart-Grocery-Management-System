import axios from 'axios';
import type { ShoppingList, ShoppingItem } from 'services/user/types';

const API_URL = 'http://localhost:8000';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shopping List API
export const shoppingListApi = {
  getAll: () => api.get<ShoppingList[]>('/shopping/shopping-lists/'),
  getById: (id: number) => api.get<ShoppingList>(`/shopping/shopping-lists/${id}/`),
  create: (data: { family_id: number; name: string; created_by: number }) => 
    api.post<ShoppingList>('/shopping/shopping-lists/', data),
  updateList: (id: number, data: { name: string }) => // <-- thêm dòng này
    api.patch<ShoppingList>(`/shopping/shopping-lists/${id}/`, data),
  update: (id: number, data: { item?: string; quantity?: number; category?: number; status?: 'pending' | 'bought' }) =>
    api.patch<ShoppingItem>(`/shopping/shopping-list-items/${id}/`, data),
  delete: (id: number) => 
    api.delete(`/shopping/shopping-lists/${id}/`),

  // Shopping List Items
  getItems: (listId: number) => 
    api.get<ShoppingItem[]>(`/shopping/shopping-list-items/?shopping_list_id=${listId}`),
  addItem: (data: { shopping_list_id: number; item: string; quantity: number }) => 
    api.post<ShoppingItem>('/shopping/shopping-list-items/', data),
  updateItem: (
  id: number,
  data: { item?: string; quantity?: number; category?: number; status?: 'pending' | 'bought' }
  ) =>
  api.patch<ShoppingItem>(`/shopping/shopping-list-items/${id}/`, data),
  deleteItem: (id: number) => 
    api.delete(`/shopping/shopping-list-items/${id}/`),
};

export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  create: (data: any) => api.post('/inventory', data),
  update: (id: number, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: number) => api.delete(`/inventory/${id}`),
};

// Recipe Types
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
  created_at?: string;
  updated_at?: string;
}

// Recipe API endpoints
export const recipeApi = {
  // Lấy danh sách công thức
  getAll: () => {
    return api.get<Recipe[]>('/recipes/');
  },

  // Tạo công thức mới
  create: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<Recipe>('/recipes/', recipe);
  },

  // Cập nhật công thức
  update: (id: number, recipe: Partial<Recipe>) => {
    return api.put<Recipe>(`/recipes/${id}/`, recipe);
  },

  // Xóa công thức
  delete: (id: number) => {
    return api.delete(`/recipes/${id}/`);
  },

  // Tìm kiếm công thức
  search: (query: string) => {
    return api.get<Recipe[]>(`/recipes/search/?q=${query}`);
  },

  // Lấy công thức theo danh mục
  getByCategory: (category: string) => {
    return api.get<Recipe[]>(`/recipes/category/${category}/`);
  },
};

export const dashboardApi = {
  getData: () => api.get('/dashboard'),
};

export const familyApi = {
  getAllFamilies: () => api.get('/users/families/'),
  createFamily: (data: { name: string }) => api.post('/users/families/', data),
  updateFamily: (id: string, data: { name: string }) => api.patch(`/users/families/${id}/`, data),
  deleteFamily: (id: string) => api.delete(`/users/families/${id}/`),

  getAllMembers: () => api.get('/users/family-members/'),
  createMember: (data: {
    name: string;
    email: string;
    relationship: string;
    age: number;
    familyId: string;
  }) => api.post('/users/family-members/', data),
  updateMember: (id: string, data: {
    name: string;
    email: string;
    relationship: string;
    age: number;
    familyId: string;
  }) => api.patch(`/users/family-members/${id}/`, data),
  deleteMember: (id: string) => api.delete(`/users/family-members/${id}/`),
};

//Auth types
export interface RegisterData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  age: number;
  phone_number: string;
  address: string;
}


export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  age: number;
  phone_number: string;
  address: string;
  family_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

// Hàm đăng ký
export const registerUser = async (data: RegisterData): Promise<Omit<RegisterData, 'password'>> => {
  const response = await axios.post(`${API_URL}/users/register/`, data);
  return response.data;
};

// Hàm đăng nhập
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/users/login/`, data);
  return response.data;
};

// Types
export interface Category {
  id?: number;  // Optional vì khi tạo mới chưa có id
  name: string;
}

export interface Food {
  id: number;
  name: string;
  category: Category;
  compartment: 'cooler' | 'freezer';
  location: string;
  quantity: number;
  registered_date: string;
  expiry_date: string;
  note?: string;
  expiry_status?: string;
  status_color?: string;
}

// API endpoints
export const fridgeApi = {
  // Lấy danh sách thực phẩm theo ngăn
  getFoods: (compartment: 'cooler' | 'freezer', search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    return axios.get<{ foods: Food[] }>(`${API_URL}/fridge/foods/${compartment}/`, { params });
  },

  // Thêm thực phẩm mới
  addFood: (food: Omit<Food, 'id'>) => {
    return axios.post<{ status: string; message: string; data: Food }>(`${API_URL}/fridge/foods/`, food);
  },

  // Cập nhật thực phẩm
  updateFood: (id: number, food: Partial<Food>) => {
    return axios.put<{ status: string; message: string; data: Food }>(`${API_URL}/fridge/foods/${id}/`, food);
  },

  // Xóa thực phẩm
  deleteFood: (id: number) => {
    return axios.delete<{ status: string; message: string }>(`${API_URL}/fridge/foods/${id}/`);
  },

  // Thêm danh mục mới
  addCategory: (category: { name: string }) => {
    return axios.post<{ status: string; message: string; data: Category }>(`${API_URL}/fridge/categories/`, category);
  },

  // Lấy danh sách categories
  getCategories: () => {
    return axios.get<Category[]>(`${API_URL}/fridge/categories/`);
  },
};

// Meal Plan Types
export interface MealPlan {
  id: number;
  date: string;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
  };
}

// Meal Plan API endpoints
export const mealPlanApi = {
  // Lấy kế hoạch bữa ăn theo tuần
  getWeeklyPlans: (startDate: string) => {
    return api.get<MealPlan[]>(`/meal_plans/weekly/${startDate}/`);
  },

  // Tạo kế hoạch bữa ăn mới
  createPlan: (plan: Omit<MealPlan, 'id'>) => {
    return api.post<MealPlan>('/meal_plans/', plan);
  },

  // Cập nhật kế hoạch bữa ăn
  updatePlan: (id: number, plan: Partial<MealPlan>) => {
    return api.put<MealPlan>(`/meal_plans/${id}/`, plan);
  },

  // Xóa kế hoạch bữa ăn
  deletePlan: (id: number) => {
    return api.delete(`/meal_plans/${id}/`);
  },

  // Lấy danh sách công thức nấu ăn
  getRecipes: () => {
    return api.get<Recipe[]>('/meal_plans/recipes/');
  },
};

export default api;
