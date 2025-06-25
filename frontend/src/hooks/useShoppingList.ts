import { useState, useEffect, useCallback } from 'react';
import { shoppingListApi } from '../services/user/api';
import type { ShoppingList, ShoppingItem } from '../services/user/types';
import { useAuth } from './useAuth';

interface CreateListData {
  name: string;
  date?: string;
  week?: string;
  shared_with?: string[];
}

export function useShoppingList() {
  const { currentUser } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shoppingListApi.getAll();
      setLists(response.data);
      if (response.data.length > 0) {
        await loadItems(response.data[0].id);
      }
    } catch (err) {
      setError('Unable to load shopping lists');
      console.error('Error loading lists:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const loadItems = async (listId: number) => {
    try {
      const response = await shoppingListApi.getItems(listId);
      setItems(response.data);
    } catch (err) {
      setError('Unable to load shopping items');
      console.error('Error loading items:', err);
    }
  };

  const createList = async (data: CreateListData) => {
  if (!currentUser) throw new Error('User not logged in');
  if (!currentUser.family_id) throw new Error('User is not a member of any family');
  try {
    setLoading(true);
    setError(null);
    const response = await shoppingListApi.create({
      ...data,
      family_id: currentUser.family_id,
      created_by: currentUser.id
    });
    setLists([...lists, response.data]);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create shopping list');
    throw err;
  } finally {
    setLoading(false);
  }
};

  const updateList = async (id: number, data: { name: string }) => {
  try {
    const response = await shoppingListApi.updateList(id, data); // <-- Đảm bảo gọi đúng API cho ShoppingList
    setLists(lists.map(list => list.id === id ? response.data : list));
    return response.data;
  } catch (err) {
    setError('Unable to update shopping list');
    throw err;
  }
};


  const deleteList = async (id: number) => {
    try {
      await shoppingListApi.delete(id);
      setLists(lists.filter(list => list.id !== id));
    } catch (err) {
      setError('Unable to delete shopping list');
      console.error(err);
      throw err;
    }
  };

  const addItem = async (data: { shopping_list_id: number; item: string; quantity: number; category?: number }): Promise<void> => {
  try {
    const response = await shoppingListApi.addItem(data);
    setItems([...items, response.data]);
  } catch (err) {
    setError('Không thể thêm mục mới');
    throw err;
  }
};

  const updateItem = async (id: number, data: { item?: string; quantity?: number; category?: number; status?: 'pending' | 'bought' }) => {
  try {
    const response = await shoppingListApi.updateItem(id, data); // <-- Đảm bảo gọi đúng API cho ShoppingItem
    setItems(items.map(item => item.id === id ? response.data : item));
    return response.data;
  } catch (err) {
    setError('Unable to update item');
    throw err;
  }
};

  const deleteItem = async (id: number) => {
    try {
      await shoppingListApi.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError('Unable to delete item');
      console.error('Error deleting item:', err);
      throw err;
    }
  };

  const toggleStatus = async (id: number) => {
  const item = items.find(i => i.id === id);
  if (!item) return;
  try {
    const response = await shoppingListApi.updateItem(id, {
      status: item.status === 'pending' ? 'bought' : 'pending'
    });
    setItems(items.map(i => i.id === id ? response.data : i));
  } catch (err) {
    setError('Không thể cập nhật trạng thái');
    throw err;
  }
};

// Lấy danh sách thành viên gia đình (ví dụ từ localStorage)
const familyMembers = (() => {
  try {
    return JSON.parse(localStorage.getItem('familyMembers') || '[]');
  } catch {
    return [];
  }
})();

  return {
    lists,
    items,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    loadItems,
    refreshLists: loadLists,
    toggleStatus,
    familyMembers,
  };
} 