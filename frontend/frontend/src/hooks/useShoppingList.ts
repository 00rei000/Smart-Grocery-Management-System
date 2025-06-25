import { useState, useEffect } from 'react';
import { shoppingListApi } from '../services/api';
import { ShoppingItem } from '../types';

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await shoppingListApi.getAll();
      setItems(response.data);
    } catch (err) {
      setError('Không thể tải danh sách mua sắm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<ShoppingItem, 'id'>) => {
    try {
      const response = await shoppingListApi.create(item);
      setItems([...items, response.data]);
      return response.data;
    } catch (err) {
      setError('Không thể thêm mục mới');
      console.error(err);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<ShoppingItem>) => {
    try {
      const response = await shoppingListApi.update(Number(id), updates);
      setItems(items.map(item => item.id === id ? response.data : item));
      return response.data;
    } catch (err) {
      setError('Không thể cập nhật mục');
      console.error(err);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await shoppingListApi.delete(Number(id));
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError('Không thể xóa mục');
      console.error(err);
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;
    
    try {
      await updateItem(id, { 
        status: item.status === 'pending' ? 'bought' : 'pending' 
      });
    } catch (err) {
      setError('Không thể cập nhật trạng thái');
      throw err;
    }
  };

  const getBoughtItems = () => {
    return items.filter(item => item.status === 'bought');
  };

  const getPendingItems = () => {
    return items.filter(item => item.status === 'pending');
  };

  const getItemsByPriority = (priority: 'low' | 'medium' | 'high') => {
    return items.filter(item => item.priority === priority);
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleStatus,
    getBoughtItems,
    getPendingItems,
    getItemsByPriority,
    refreshItems: loadItems,
  };
} 