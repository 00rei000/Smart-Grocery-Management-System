import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { Recipe, recipeApi } from '../../services/user/api';

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await recipeApi.getAll();
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách công thức');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = () => {
    setCurrentRecipe(null);
    setOpenDialog(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setOpenDialog(true);
  };

  const handleDeleteRecipe = async (id: number) => {
    try {
      await recipeApi.delete(id);
      setRecipes(recipes.filter(recipe => recipe.id !== id));
      setError(null);
    } catch (err) {
      setError('Không thể xóa công thức');
      console.error('Error deleting recipe:', err);
    }
  };

  const handleSaveRecipe = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const recipeData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      ingredients: (formData.get('ingredients') as string).split('\n').filter(Boolean),
      instructions: (formData.get('instructions') as string).split('\n').filter(Boolean),
      prepTime: Number(formData.get('prepTime')),
      cookTime: Number(formData.get('cookTime')),
      servings: Number(formData.get('servings')),
      difficulty: formData.get('difficulty') as 'easy' | 'medium' | 'hard',
      category: (formData.get('category') as string).split(',').map(c => c.trim()),
    };

    try {
      if (currentRecipe) {
        const response = await recipeApi.update(currentRecipe.id, recipeData);
        setRecipes(recipes.map(recipe => 
          recipe.id === currentRecipe.id ? response.data : recipe
        ));
      } else {
        const response = await recipeApi.create(recipeData);
        setRecipes([...recipes, response.data]);
      }
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError('Không thể lưu công thức');
      console.error('Error saving recipe:', err);
    }
  };

  const filteredRecipes = recipes.filter((recipe: Recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Công thức nấu ăn
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tìm kiếm công thức"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRecipe}
            >
              Thêm công thức mới
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {filteredRecipes.map((recipe: Recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {recipe.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {recipe.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={`${recipe.prepTime + recipe.cookTime} phút`}
                    size="small"
                  />
                  <Chip
                    icon={<GroupIcon />}
                    label={`${recipe.servings} người`}
                    size="small"
                  />
                  <Chip
                    label={recipe.difficulty}
                    color={
                      recipe.difficulty === 'easy'
                        ? 'success'
                        : recipe.difficulty === 'medium'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {recipe.category.map((cat: string) => (
                    <Chip key={cat} label={cat} size="small" />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEditRecipe(recipe)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteRecipe(recipe.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSaveRecipe}>
          <DialogTitle>
            {currentRecipe ? 'Chỉnh sửa công thức' : 'Thêm công thức mới'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên công thức"
                  name="name"
                  defaultValue={currentRecipe?.name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  multiline
                  rows={2}
                  defaultValue={currentRecipe?.description}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nguyên liệu (mỗi dòng một nguyên liệu)"
                  name="ingredients"
                  multiline
                  rows={4}
                  defaultValue={currentRecipe?.ingredients.join('\n')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hướng dẫn (mỗi dòng một bước)"
                  name="instructions"
                  multiline
                  rows={4}
                  defaultValue={currentRecipe?.instructions.join('\n')}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Thời gian chuẩn bị (phút)"
                  name="prepTime"
                  type="number"
                  defaultValue={currentRecipe?.prepTime}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Thời gian nấu (phút)"
                  name="cookTime"
                  type="number"
                  defaultValue={currentRecipe?.cookTime}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Khẩu phần"
                  name="servings"
                  type="number"
                  defaultValue={currentRecipe?.servings}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Độ khó"
                  name="difficulty"
                  select
                  defaultValue={currentRecipe?.difficulty || 'medium'}
                  required
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Danh mục (phân cách bằng dấu phẩy)"
                  name="category"
                  defaultValue={currentRecipe?.category.join(', ')}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 