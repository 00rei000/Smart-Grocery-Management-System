import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import { format, addWeeks, startOfWeek, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MealPlan, Recipe } from '../../types';

// Giả lập hook useMealPlan (sẽ được thay thế bằng hook thật khi có API)
const useMealPlan = () => {
  const [plans, setPlans] = useState<MealPlan[]>([]);

  const addPlan = (plan: Omit<MealPlan, 'id'>) => {
    const newPlan = { ...plan, id: Date.now() };
    setPlans([...plans, newPlan]);
  };

  const updatePlan = (id: number, updates: Partial<MealPlan>) => {
    setPlans(plans.map(plan =>
      plan.id === id ? { ...plan, ...updates } : plan
    ));
  };

  const deletePlan = (id: number) => {
    setPlans(plans.filter(plan => plan.id !== id));
  };

  return {
    plans,
    addPlan,
    updatePlan,
    deletePlan,
  };
};

// Giả lập hook useRecipes (sẽ được thay thế bằng hook thật)
const useRecipes = () => {
  const [recipes] = useState<Recipe[]>([
    {
      id: 1,
      name: 'Phở bò',
      description: 'Món ăn truyền thống Việt Nam',
      ingredients: [],
      instructions: [],
      prepTime: 30,
      cookTime: 60,
      servings: 4,
      difficulty: 'medium',
      category: ['Món chính'],
    },
    // Thêm các công thức mẫu khác
  ]);

  return { recipes };
};

export default function MealPlanner() {
  const { plans, addPlan, updatePlan, deletePlan } = useMealPlan();
  const { recipes } = useRecipes();
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date()));
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleAddMeal = (date: Date, meal: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedDate(date);
    setSelectedMeal(meal);
    setOpenDialog(true);
  };

  const handleSaveMeal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDate || !selectedMeal) return;

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const recipeId = Number(formData.get('recipe'));
    const recipe = recipes.find(r => r.id === recipeId);

    if (!recipe) return;

    const existingPlan = plans.find(p => p.date === format(selectedDate, 'yyyy-MM-dd'));

    if (existingPlan) {
      updatePlan(existingPlan.id, {
        meals: {
          ...existingPlan.meals,
          [selectedMeal]: recipe,
        },
      });
    } else {
      addPlan({
        date: format(selectedDate, 'yyyy-MM-dd'),
        meals: {
          [selectedMeal]: recipe,
        },
      });
    }

    setOpenDialog(false);
  };

  const handleDeleteMeal = (planId: number, meal: 'breakfast' | 'lunch' | 'dinner') => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const updatedMeals = { ...plan.meals };
    delete updatedMeals[meal];

    if (Object.keys(updatedMeals).length === 0) {
      deletePlan(planId);
    } else {
      updatePlan(planId, { meals: updatedMeals });
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Lập kế hoạch bữa ăn
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton onClick={handlePreviousWeek}>
            <NavigateBefore />
          </IconButton>
          <Typography variant="h6">
            Tuần {format(currentWeek, 'dd/MM/yyyy', { locale: vi })}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {weekDays.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const plan = plans.find(p => p.date === dateStr);

          return (
            <Grid item xs={12} key={dateStr}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {format(date, 'EEEE, dd/MM', { locale: vi })}
                </Typography>
                <Grid container spacing={2}>
                  {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                    <Grid item xs={12} md={4} key={meal}>
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, height: '100%', minHeight: 120 }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {meal === 'breakfast' ? 'Bữa sáng' :
                           meal === 'lunch' ? 'Bữa trưa' : 'Bữa tối'}
                        </Typography>
                        {plan?.meals[meal] ? (
                          <Box>
                            <Typography>{plan.meals[meal]?.name}</Typography>
                            <Box sx={{ mt: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedDate(date);
                                  setSelectedMeal(meal);
                                  setOpenDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteMeal(plan.id, meal)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => handleAddMeal(date, meal)}
                          >
                            Thêm món
                          </Button>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleSaveMeal}>
          <DialogTitle>
            {selectedDate && selectedMeal && (
              `${selectedMeal === 'breakfast' ? 'Bữa sáng' :
                selectedMeal === 'lunch' ? 'Bữa trưa' : 'Bữa tối'} - 
              ${format(selectedDate, 'EEEE, dd/MM', { locale: vi })}`
            )}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chọn món ăn</InputLabel>
              <Select
                name="recipe"
                label="Chọn món ăn"
                defaultValue=""
                required
              >
                {recipes.map((recipe) => (
                  <MenuItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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