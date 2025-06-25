import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import {
  Box, Typography, Grid, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, Divider, Chip,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Share as ShareIcon, Check as CheckIcon, Group as GroupIcon
} from '@mui/icons-material';
import { useShoppingList } from '../../hooks/useShoppingList';

interface Category {
  id: number;
  name: string;
}

interface FamilyMember {
  name: string;
  email: string;
}

interface ShoppingList {
  id: number;
  name: string;
  date?: string;
  week?: string;
  shared_with?: string[];
}

interface ShoppingListItem {
  id: number;
  item: string;
  quantity: number;
  category?: number; // Use category ID
  status: 'pending' | 'bought';
  created_at: string;
}

interface CreateListData {
  name: string;
  date?: string;
  week?: string;
  shared_with?: string[];
}

interface AddItemData {
  shopping_list_id: number;
  item: string;
  quantity: number;
  category?: number;
}


export default function ShoppingListPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [openListDialog, setOpenListDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [dateType, setDateType] = useState<'date' | 'week'>('date');
  const [shareWith, setShareWith] = useState<string[]>([]);
  const [category, setCategory] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    lists,
    items,
    loading,
    error,
    createList,
    addItem,
    deleteItem,
    loadItems,
    toggleStatus,
    familyMembers
  }: {
    lists: ShoppingList[];
    items: ShoppingListItem[];
    loading: boolean;
    error: string | null;
    createList: (data: CreateListData) => Promise<void>;
    addItem: (data: AddItemData) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
    loadItems: (listId: number) => void;
    toggleStatus: (id: number) => Promise<void>;
    familyMembers: FamilyMember[];
  } = useShoppingList();

  // Token handling
  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      throw new Error('No refresh token found. Please log in again.');
    }
    try {
      const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      throw error;
    }
  }, []);

  const getToken = useCallback(async () => {
    let token = localStorage.getItem('access_token');
    if (!token) {
      token = await refreshToken();
    }
    return token;
  }, [refreshToken]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/categories/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text.startsWith('<!DOCTYPE html>') ? 'Unexpected HTML response' : `HTTP ${response.status}: ${text}`);
        }
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setFormError('Không thể tải danh mục');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [getToken]);

  // Select first list and load items
  useEffect(() => {
    if (lists.length > 0 && !selectedList) {
      setSelectedList(lists[0].id);
    }
  }, [lists, selectedList]);

  useEffect(() => {
    if (selectedList) {
      loadItems(selectedList);
    }
  }, [selectedList, loadItems]);

  // Polling for real-time updates
  useEffect(() => {
    if (!selectedList) return;
    const interval = setInterval(() => {
      loadItems(selectedList);
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [selectedList, loadItems]);

  const handleCreateList = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const date = formData.get('date') as string;
    const week = formData.get('week') as string;

    // Validate inputs
    if (!name.trim()) {
      setFormError('Tên danh sách là bắt buộc');
      return;
    }
    if (dateType === 'date' && date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError('Ngày không đúng định dạng (YYYY-MM-DD)');
      return;
    }
    if (dateType === 'week' && week && !/^\d{4}-W\d{2}$/.test(week)) {
      setFormError('Tuần không đúng định dạng (YYYY-WWW, ví dụ: 2024-W21)');
      return;
    }
    if (shareWith.length > 0 && shareWith.some(email => !familyMembers.find(m => m.email === email))) {
      setFormError('Một số email chia sẻ không hợp lệ');
      return;
    }

    try {
      await createList({
        name: name.trim(),
        date: dateType === 'date' ? date : undefined,
        week: dateType === 'week' ? week : undefined,
        shared_with: shareWith
      });
      setOpenListDialog(false);
      form.reset();
      setShareWith([]);
      setDateType('date');
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo danh sách mua sắm');
      console.error('Error creating shopping list:', err);
    }
  };

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedList) {
      setFormError('Vui lòng chọn danh sách');
      return;
    }
    setFormError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const itemName = formData.get('name') as string;
    const quantity = Number(formData.get('quantity'));

    // Validate inputs
    if (!itemName.trim()) {
      setFormError('Tên mục là bắt buộc');
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      setFormError('Số lượng phải là số dương');
      return;
    }
    if (!category) {
      setFormError('Danh mục là bắt buộc');
      return;
    }

    const newItem: AddItemData = {
      shopping_list_id: selectedList,
      item: itemName.trim(),
      quantity,
      category: Number(category)
    };

    try {
      await addItem(newItem);
      setOpenDialog(false);
      form.reset();
      setCategory('');
    } catch (err: any) {
      setFormError(err.message || 'Không thể thêm mục');
      console.error('Error adding item:', err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteItem(id);
    } catch (err: any) {
      setFormError(err.message || 'Không thể xóa mục');
      console.error('Error deleting item:', err);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id);
    } catch (err: any) {
      setFormError(err.message || 'Không thể cập nhật trạng thái');
      console.error('Error updating status:', err);
    }
  };

  if (loading || loadingCategories) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Danh sách Mua sắm
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Chọn danh sách</InputLabel>
              <Select
                value={selectedList ?? ''}
                label="Chọn danh sách"
                onChange={(e) => setSelectedList(Number(e.target.value))}
              >
                {lists.map((list) => (
                  <MenuItem key={list.id} value={list.id}>
                    {list.name} {list.date && `(Ngày: ${list.date})`} {list.week && `(Tuần: ${list.week})`}
                    {list.shared_with && list.shared_with.length > 0 && (
                      <Chip
                        size="small"
                        icon={<ShareIcon />}
                        label={`Chia sẻ: ${list.shared_with.map((email: string) =>
                          familyMembers.find((m) => m.email === email)?.name || email
                        ).join(', ')}`}
                        sx={{ ml: 1 }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenListDialog(true)}
              >
                Tạo danh sách mới
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                disabled={!selectedList}
              >
                Thêm mục
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {(error || formError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || formError}
        </Alert>
      )}

      <Paper elevation={3}>
        <List>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <IconButton
                  edge="start"
                  aria-label="toggle status"
                  onClick={() => handleToggleStatus(item.id)}
                  color={item.status === 'bought' ? 'success' : 'default'}
                >
                  <CheckIcon />
                </IconButton>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.item}
                      <Chip
                        size="small"
                        label={categories.find(cat => cat.id === item.category)?.name || 'Chưa phân loại'}
                        color="info"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography component="span" variant="body2">
                        Số lượng: {item.quantity}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={`Tạo: ${new Date(item.created_at).toLocaleDateString('vi-VN')}`}
                          icon={<ShareIcon />}
                        />
                        <Chip
                          size="small"
                          label={item.status === 'bought' ? 'Đã mua' : 'Chưa mua'}
                          color={item.status === 'bought' ? 'success' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Add Item Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleAddItem}>
          <DialogTitle>Thêm mục mới</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Tên mục"
              type="text"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="quantity"
              label="Số lượng"
              type="number"
              inputProps={{ min: 0.01, step: 0.01 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={category}
                label="Danh mục"
                onChange={e => setCategory(Number(e.target.value))}
                required
              >
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Đang thêm...' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create List Dialog */}
      <Dialog open={openListDialog} onClose={() => setOpenListDialog(false)}>
        <form onSubmit={handleCreateList}>
          <DialogTitle>Tạo danh sách mua sắm mới</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Tên danh sách"
              type="text"
              autoFocus
            />
            <Box sx={{ mt: 2 }}>
              <ToggleButtonGroup
                value={dateType}
                exclusive
                onChange={(_, value) => value && setDateType(value)}
                aria-label="Chọn loại"
                fullWidth
              >
                <ToggleButton value="date">Theo ngày</ToggleButton>
                <ToggleButton value="week">Theo tuần</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {dateType === 'date' ? (
              <TextField
                margin="normal"
                fullWidth
                name="date"
                label="Ngày"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <TextField
                margin="normal"
                fullWidth
                name="week"
                label="Tuần (ví dụ: 2024-W21)"
                type="text"
                InputLabelProps={{ shrink: true }}
                placeholder="YYYY-WWW"
              />
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chia sẻ với thành viên</InputLabel>
              <Select
                multiple
                value={shareWith}
                onChange={e => setShareWith(e.target.value as string[])}
                renderValue={selected => (selected as string[]).map(email =>
                  familyMembers.find((m) => m.email === email)?.name || email
                ).join(', ')}
              >
                {familyMembers.map((member) => (
                  <MenuItem key={member.email} value={member.email}>
                    <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                    {member.name} ({member.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenListDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}