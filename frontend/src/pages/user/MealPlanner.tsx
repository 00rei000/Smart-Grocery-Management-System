import React, { useState, useEffect, useCallback } from 'react';
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
import { enUS } from 'date-fns/locale';
import { MealPlan, Recipe, mealPlanApi } from '../../services/user/api';

export default function MealPlanner() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date()));
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyPlans = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = format(currentWeek, 'yyyy-MM-dd');
      const response = await mealPlanApi.getWeeklyPlans(startDate);
      setPlans(response.data);
      setError(null);
    } catch (err) {
      setError('Unable to load meal plans');
      console.error('Error fetching meal plans:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWeek]);

  const fetchRecipes = useCallback(async () => {
    try {
      const response = await mealPlanApi.getRecipes();
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyPlans();
    fetchRecipes();
  }, [fetchWeeklyPlans, fetchRecipes]);

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

  const handleSaveMeal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDate || !selectedMeal) return;

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const recipeId = Number(formData.get('recipe'));
    const recipe = recipes.find(r => r.id === recipeId);

    if (!recipe) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingPlan = plans.find(p => p.date === dateStr);

    try {
      if (existingPlan) {
        const updatedMeals = {
          ...existingPlan.meals,
          [selectedMeal]: recipe,
        };
        const response = await mealPlanApi.updatePlan(existingPlan.id, { meals: updatedMeals });
        setPlans(plans.map(plan => 
          plan.id === existingPlan.id ? response.data : plan
        ));
      } else {
        const newPlan = {
          date: dateStr,
          meals: {
            [selectedMeal]: recipe,
          },
        };
        const response = await mealPlanApi.createPlan(newPlan);
        setPlans([...plans, response.data]);
      }
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError('Unable to save meal plan');
      console.error('Error saving meal plan:', err);
    }
  };

  const handleDeleteMeal = async (planId: number, meal: 'breakfast' | 'lunch' | 'dinner') => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const updatedMeals = { ...plan.meals };
      delete updatedMeals[meal];

      if (Object.keys(updatedMeals).length === 0) {
        await mealPlanApi.deletePlan(planId);
        setPlans(plans.filter(p => p.id !== planId));
      } else {
        const response = await mealPlanApi.updatePlan(planId, { meals: updatedMeals });
        setPlans(plans.map(p => p.id === planId ? response.data : p));
      }
      setError(null);
    } catch (err) {
      setError('Unable to delete meal');
      console.error('Error deleting meal:', err);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

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
          Meal Planning
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton onClick={handlePreviousWeek}>
            <NavigateBefore />
          </IconButton>
          <Typography variant="h6">
            Week of {format(currentWeek, 'dd/MM/yyyy', { locale: enUS })}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {weekDays.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const plan = plans.find(p => p.date === dateStr);

          return (
            <Grid item xs={12} key={dateStr}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {format(date, 'EEEE, dd/MM', { locale: enUS })}
                </Typography>
                <Grid container spacing={2}>
                  {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                    <Grid item xs={12} md={4} key={meal}>
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, height: '100%', minHeight: 120 }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {meal === 'breakfast' ? 'Breakfast' :
                           meal === 'lunch' ? 'Lunch' : 'Dinner'}
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
                            Add Meal
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
              `${selectedMeal === 'breakfast' ? 'Breakfast' :
                selectedMeal === 'lunch' ? 'Lunch' : 'Dinner'} - 
              ${format(selectedDate, 'EEEE, dd/MM', { locale: enUS })}`
            )}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Recipe</InputLabel>
              <Select
                name="recipe"
                label="Select Recipe"
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
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 