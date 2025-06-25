import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../services/api';
import { InventoryItem } from '../types';

export function useInventory() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query để lấy danh sách inventory
  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      try {
        const response = await inventoryApi.getAll();
        return response.data;
      } catch (err) {
        setError('Không thể tải danh sách thực phẩm');
        throw err;
      }
    },
  });

  // Mutation để thêm item mới
  const addMutation = useMutation({
    mutationFn: (newItem: Omit<InventoryItem, 'id'>) => inventoryApi.create(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => {
      setError('Không thể thêm thực phẩm mới');
    },
  });

  // Mutation để cập nhật item
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InventoryItem> }) =>
      inventoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => {
      setError('Không thể cập nhật thực phẩm');
    },
  });

  // Mutation để xóa item
  const deleteMutation = useMutation({
    mutationFn: (id: number) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => {
      setError('Không thể xóa thực phẩm');
    },
  });

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      await addMutation.mutateAsync(item);
    } catch (err) {
      throw err;
    }
  };

  const updateItem = async (id: number, item: Partial<InventoryItem>) => {
    try {
      await updateMutation.mutateAsync({ id, data: item });
    } catch (err) {
      throw err;
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      throw err;
    }
  };

  const getNearExpiryItems = (days: number) => {
    const today = new Date();
    return items.filter((item: InventoryItem) => {
      const expiryDate = new Date(item.expiryDate);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days && diffDays >= 0;
    });
  };

  const getExpiredItems = () => {
    return items.filter((item: InventoryItem) => {
      return new Date(item.expiryDate) < new Date();
    });
  };

  const searchItems = (searchTerm: string) => {
    return items.filter((item: InventoryItem) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    getNearExpiryItems,
    getExpiredItems,
    searchItems,
  };
} 