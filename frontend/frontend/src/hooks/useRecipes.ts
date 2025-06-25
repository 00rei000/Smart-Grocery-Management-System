import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '../services/api';
import { Recipe } from '../types';

export function useRecipes() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query để lấy danh sách công thức
  const { data: recipes = [], isLoading: loading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      try {
        const response = await recipeApi.getAll();
        return response.data;
      } catch (err) {
        setError('Không thể tải danh sách công thức');
        throw err;
      }
    },
  });

  // Mutation để thêm công thức mới
  const addMutation = useMutation({
    mutationFn: (newRecipe: Omit<Recipe, 'id'>) => recipeApi.create(newRecipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: () => {
      setError('Không thể thêm công thức mới');
    },
  });

  // Mutation để cập nhật công thức
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Recipe> }) =>
      recipeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: () => {
      setError('Không thể cập nhật công thức');
    },
  });

  // Mutation để xóa công thức
  const deleteMutation = useMutation({
    mutationFn: (id: number) => recipeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: () => {
      setError('Không thể xóa công thức');
    },
  });

  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    try {
      await addMutation.mutateAsync(recipe);
    } catch (err) {
      throw err;
    }
  };

  const updateRecipe = async (id: number, recipe: Partial<Recipe>) => {
    try {
      await updateMutation.mutateAsync({ id, data: recipe });
    } catch (err) {
      throw err;
    }
  };

  const deleteRecipe = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      throw err;
    }
  };

  const searchRecipes = (query: string) => {
    return recipes.filter((recipe: Recipe) =>
      recipe.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
  };
} 