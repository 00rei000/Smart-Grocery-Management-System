import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardMedia, CardContent,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Upload as UploadIcon } from '@mui/icons-material';
import CustomSnackbar from '../../components/CustomSnackbar'; 
import type { AlertColor } from '@mui/material/Alert';

interface Recipe {
  id: number;
  title: string;
  img_url: string;
  ingredients?: string;
  instructions?: string;
}

export default function CategoryManager() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as AlertColor });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [totalCount, setTotalCount] = useState(0);

  // Memoize getToken and refreshToken
  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token found. Please log in again.');
    try {
      const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) throw new Error('Token refresh failed');
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setSnackbar({open:true, message:"token hết hạn vui lòng đăng nhập lại", severity:'error'})
      throw error;
    }
  }, []);

  const getToken = useCallback(async () => {
    let token = localStorage.getItem('access_token');
    if (!token) token = await refreshToken();
    return token;
  }, [refreshToken]);

  // Fetch recipes with pagination
  const fetchRecipes = useCallback(async (search = '', pageNum = 1, pageSize = rowsPerPage) => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', String(pageNum));
      params.append('page_size', String(pageSize));
      const url = `http://localhost:8000/meal-plans/recipes/list/?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text.startsWith('<!DOCTYPE') ? 'Received HTML instead of JSON, likely authentication error' : `HTTP ${response.status}: ${text}`);
      }
      const data = await response.json();
      setRecipes(data.results || data);
      setTotalCount(data.count || (data.results ? data.results.length : data.length));
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      setSnackbar({ open: true, message: `Không thể tải công thức: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [getToken, rowsPerPage]);

  useEffect(() => {
  fetchRecipes(searchTerm, page + 1, rowsPerPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]); // KHÔNG có searchTerm ở đây

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchRecipes(searchTerm, 1, rowsPerPage);
  };

  const handleOpenDialog = (recipe?: Recipe) => {
    if (recipe) {
      setSelectedRecipe(recipe);
      setFormData({
        title: recipe.title,
        ingredients: recipe.ingredients || '',
        instructions: recipe.instructions || '',
      });
    } else {
      setSelectedRecipe(null);
      setFormData({
        title: '',
        ingredients: '',
        instructions: '',
      });
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecipe(null);
    setImageFile(null);
  };

  // PATCH update or POST create recipe
  const handleSubmit = async () => {
    if (!formData.title || !formData.ingredients || !formData.instructions) {
      setSnackbar({ open: true, message: 'Vui lòng điền đầy đủ thông tin công thức', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      let url = '';
      let method: 'POST' | 'PATCH';
      let body: FormData | string;
      let headers: any = { 'Authorization': `Bearer ${token}` };

      if (selectedRecipe) {
        url = `http://localhost:8000/meal-plans/recipes/update/${selectedRecipe.id}/`;
        method = 'PATCH';
      } else {
        url = 'http://localhost:8000/meal-plans/recipes/create/';
        method = 'POST';
      }

      // Nếu có ảnh, gửi multipart
      if (imageFile) {
        const formDataSend = new FormData();
        formDataSend.append('title', formData.title);
        formDataSend.append('ingredients', formData.ingredients);
        formDataSend.append('instructions', formData.instructions);
        formDataSend.append('image', imageFile);
        body = formDataSend;
        // Không set Content-Type, để browser tự set boundary
      } else {
        const payload: any = {
          title: formData.title,
          ingredients: formData.ingredients,
          instructions: formData.instructions,
        };
        if (selectedRecipe && selectedRecipe.img_url) payload.img_url = selectedRecipe.img_url;
        body = JSON.stringify(payload);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(text.startsWith('<!DOCTYPE') ? 'Received HTML instead of JSON, likely authentication error' : `HTTP ${response.status}: ${text}`);
        }
        throw new Error(errorData.detail || 'Failed to save recipe');
      }
      await fetchRecipes(searchTerm, page + 1, rowsPerPage);
      handleCloseDialog();
      if(selectedRecipe){
        setSnackbar({ open: true, message: 'Cập nhật công thức thành công!', severity: 'success' });
      } else setSnackbar({open: true, message: 'Thêm công thức mới thành công', severity:'success'})
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      setSnackbar({ open: true, message: `Không thể lưu công thức: ${error.message}`, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recipeId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công thức này?')) {
      try {
        const token = await getToken();
        const response = await fetch(`http://localhost:8000/meal-plans/recipes/delete/${recipeId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const text = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch {
            throw new Error(text.startsWith('<!DOCTYPE') ? 'Received HTML instead of JSON, likely authentication error' : `HTTP ${response.status}: ${text}`);
          }
          throw new Error(errorData.detail || 'Failed to delete recipe');
        }
        await fetchRecipes(searchTerm, page + 1, rowsPerPage);
        setSnackbar({ open: true, message: 'Xóa công thức thành công!', severity: 'success' });
      } catch (error: any) {
        console.error('Error deleting recipe:', error);
        setSnackbar({ open: true, message: `Không thể xóa công thức: ${error.message}`, severity: 'error' });
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    fetchRecipes(searchTerm, newPage + 1, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
    fetchRecipes(searchTerm, 1, newSize);
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý công thức
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          startIcon={<UploadIcon />}
        >
          Tạo công thức mới
        </Button>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>
            Tìm kiếm
          </Button>
        </form>
      </Box>

      <Grid container spacing={3}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={recipe.img_url ? "http://localhost:8000" + recipe.img_url : 'https://via.placeholder.com/200'}
                alt={recipe.title}
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {recipe.title}
                </Typography>
              </CardContent>
              <CardContent>
                <IconButton size="small" onClick={() => handleOpenDialog(recipe)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(recipe.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TablePagination
        rowsPerPageOptions={[9, 18, 27]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRecipe ? 'Chỉnh sửa công thức' : 'Thêm công thức mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Tên món ăn"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, title: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Nguyên liệu"
              value={formData.ingredients}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, ingredients: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Hướng dẫn"
              value={formData.instructions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              fullWidth
              multiline
              rows={4}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Tải ảnh lên
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
            </Button>
            {imageFile && (
              <>
                <Typography variant="body2">{imageFile.name}</Typography>
                <Box sx={{ mt: 1 }}>
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
                  />
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Đang lưu...' : selectedRecipe ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}