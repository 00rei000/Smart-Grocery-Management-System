import axios from 'axios';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL?: string;
    }
  }
}

const API_BASE_URL: string = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inventory APIs
export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getById: (id: number) => api.get(`/inventory/${id}`),
  create: (data: any) => api.post('/inventory', data),
  update: (id: number, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: number) => api.delete(`/inventory/${id}`),
};

// Shopping List APIs
export const shoppingListApi = {
  getAll: () => api.get('/shopping-list'),
  create: (data: any) => api.post('/shopping-list', data),
  update: (id: number, data: any) => api.put(`/shopping-list/${id}`, data),
  delete: (id: number) => api.delete(`/shopping-list/${id}`),
};

// Recipe APIs
export const recipeApi = {
  getAll: () => api.get('/recipes'),
  getById: (id: number) => api.get(`/recipes/${id}`),
  create: (data: any) => api.post('/recipes', data),
  update: (id: number, data: any) => api.put(`/recipes/${id}`, data),
  delete: (id: number) => api.delete(`/recipes/${id}`),
  search: (query: string) => api.get(`/recipes/search?q=${query}`),
};

// Meal Plan APIs
export const mealPlanApi = {
  getWeeklyPlan: () => api.get('/meal-plan/weekly'),
  createPlan: (data: any) => api.post('/meal-plan', data),
  updatePlan: (id: number, data: any) => api.put(`/meal-plan/${id}`, data),
  deletePlan: (id: number) => api.delete(`/meal-plan/${id}`),
};

export default api; 