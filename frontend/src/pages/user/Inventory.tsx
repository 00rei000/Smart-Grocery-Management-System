import React, { useState, useEffect, useCallback } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Add,
  Remove,
  Kitchen,
  LocalFlorist,
  Restaurant,
  LocalDrink,
  Egg,
  LocalGroceryStore,
  EmojiFoodBeverage,
  LocalDining,
  LocalPizza,
  Cake,
  AcUnit,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Food, fridgeApi } from '../../services/user/api';

// Food categories and their corresponding icons
const categories = {
  'Vegetables': LocalFlorist,
  'Fruits': Restaurant,
  'Meat': LocalDining,
  'Fish': LocalPizza,
  'Dairy': LocalDrink,
  'Beverages': EmojiFoodBeverage,
  'Dry Goods': LocalGroceryStore,
  'Spices': Cake,
  'Others': Egg,
} as const;

type CategoryName = keyof typeof categories;

// Fridge locations
const locations = {
  'Refrigerator': [
    'Top Door',
    'Bottom Door',
    'Vegetable Drawer',
    'Middle Shelf',
    'Bottom Shelf'
  ],
  'Freezer': [
    'Top Shelf',
    'Middle Shelf',
    'Bottom Shelf'
  ]
} as const;

type FridgeType = keyof typeof locations;
type Location = typeof locations[FridgeType][number];

// Map between frontend and backend
const compartmentMap = {
  'Refrigerator': 'cooler',
  'Freezer': 'freezer'
} as const;

export default function Inventory() {
  const [items, setItems] = useState<Food[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<Food | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>('Vegetables');
  const [selectedLocation, setSelectedLocation] = useState<Location>('Top Door');
  const [selectedFridgeType, setSelectedFridgeType] = useState<FridgeType>('Refrigerator');
  const [quantity, setQuantity] = useState(1);
  const [selectedFridgeView, setSelectedFridgeView] = useState<FridgeType>('Refrigerator');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fridgeApi.getFoods(compartmentMap[selectedFridgeView], searchTerm);
      setItems(response.data.foods);
      setError(null);
    } catch (err) {
      setError('Unable to load food items');
      console.error('Error fetching inventory items:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFridgeView, searchTerm]);

  useEffect(() => {
    fetchItems();
  }, [selectedFridgeView, searchTerm, fetchItems]);

  const handleAddItem = () => {
    setCurrentItem(null);
    setOpenDialog(true);
  };

  const handleEditItem = (item: Food) => {
    setCurrentItem(item);
    setSelectedCategory(item.category.name as CategoryName);
    setSelectedLocation(item.location as Location);
    setSelectedFridgeType(item.compartment === 'cooler' ? 'Refrigerator' : 'Freezer');
    setQuantity(item.quantity);
    setOpenDialog(true);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await fridgeApi.deleteFood(id);
      setItems(items.filter(item => item.id !== id));
      setError(null);
    } catch (err) {
      setError('Unable to delete food item');
      console.error('Error deleting inventory item:', err);
    }
  };

  const handleSaveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const itemData = {
      name: formData.get('name') as string,
      category: { name: selectedCategory },
      compartment: compartmentMap[selectedFridgeType],
      location: selectedLocation,
      quantity: quantity,
      registered_date: formData.get('registerDate') as string,
      expiry_date: formData.get('expiryDate') as string,
      note: formData.get('note') as string,
    };

    try {
      if (currentItem) {
        const response = await fridgeApi.updateFood(currentItem.id, itemData);
        setItems(items.map(item => 
          item.id === currentItem.id ? response.data.data : item
        ));
      } else {
        const response = await fridgeApi.addFood(itemData);
        setItems([...items, response.data.data]);
      }
      setOpenDialog(false);
      resetForm();
      setError(null);
    } catch (err) {
      console.error('Error saving food item:', err);
      setError('Unable to save food item. Please check your input and try again.');
    }
  };

  const resetForm = () => {
    setSelectedCategory('Vegetables');
    setSelectedLocation('Top Door');
    setSelectedFridgeType('Refrigerator');
    setQuantity(1);
  };

  const getNearExpiryItems = (days: number) => {
    const today = new Date();
    return items.filter(item => {
      const expiryDate = new Date(item.expiry_date);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days && diffDays >= 0;
    });
  };

  const nearExpiryItems = getNearExpiryItems(3);

  const getItemStatus = (item: Food) => {
    if (item.status_color === 'red') {
      return { label: 'Expired', color: 'error' as const };
    }
    if (item.status_color === 'orange') {
      return { label: 'Expiring Soon', color: 'warning' as const };
    }
    return { label: 'Good', color: 'success' as const };
  };

  // Filter food items by compartment and search term
  const fridgeItems = items.filter((item: Food) => 
    item.compartment === compartmentMap[selectedFridgeView]
  );
  
  // Group food items by category
  const groupedItems = fridgeItems.reduce((acc: Partial<Record<CategoryName, Food[]>>, item: Food) => {
    const category = item.category.name as CategoryName;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category]?.push(item);
    return acc;
  }, {} as Partial<Record<CategoryName, Food[]>>);

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
          Fridge Management
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search food items"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Add New Food Item
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {nearExpiryItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {nearExpiryItems.length} items expiring in the next 3 days!
        </Alert>
      )}

      {/* Select compartment */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card 
            onClick={() => setSelectedFridgeView('Refrigerator')}
            sx={{ 
              cursor: 'pointer',
              bgcolor: selectedFridgeView === 'Refrigerator' ? 'primary.light' : 'background.paper'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Kitchen fontSize="large" />
                <Typography variant="h6">Refrigerator</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card 
            onClick={() => setSelectedFridgeView('Freezer')}
            sx={{ 
              cursor: 'pointer',
              bgcolor: selectedFridgeView === 'Freezer' ? 'primary.light' : 'background.paper'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AcUnit fontSize="large" />
                <Typography variant="h6">Freezer</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Display food items by compartment */}
      <Card>
        <CardHeader
          title={selectedFridgeView}
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {selectedFridgeView === 'Refrigerator' ? <Kitchen /> : <AcUnit />}
            </Avatar>
          }
        />
        <CardContent>
          {Object.entries(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, items]) => {
              const Icon = categories[category as CategoryName];
              return (
                <Box key={category} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Icon sx={{ mr: 1 }} />
                    <Typography variant="h6">{category}</Typography>
                  </Box>
                  <List>
                    {(items as Food[]).map((item: Food) => {
                      const status = getItemStatus(item);
                      return (
                        <ListItem key={item.id}>
                          <ListItemIcon>
                            <Icon />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.name}
                            secondary={
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="body2">
                                  {`${item.quantity} units - Expiry: ${new Date(item.expiry_date).toLocaleDateString()}`}
                                </Typography>
                                <Chip 
                                  label={status.label} 
                                  color={status.color}
                                  size="small"
                                  sx={{ width: 'fit-content' }}
                                />
                              </Box>
                            }
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton onClick={() => handleEditItem(item)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteItem(item.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                  <Divider />
                </Box>
              );
            })
          ) : (
            <Typography color="text.secondary" align="center">
              {selectedFridgeView} is empty
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleSaveItem}>
          <DialogTitle>
            {currentItem ? 'Edit Food Item' : 'Add New Food Item'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Food Name"
                  name="name"
                  defaultValue={currentItem?.name}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value as CategoryName)}
                    required
                  >
                    {Object.keys(categories).map((categoryName) => {
                      const Icon = categories[categoryName as CategoryName];
                      return (
                        <MenuItem key={categoryName} value={categoryName}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon />
                            {categoryName}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Compartment Type</InputLabel>
                  <Select
                    value={selectedFridgeType}
                    label="Compartment Type"
                    onChange={(e) => setSelectedFridgeType(e.target.value as FridgeType)}
                    required
                  >
                    <MenuItem value="Refrigerator">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Kitchen />
                        Refrigerator
                      </Box>
                    </MenuItem>
                    <MenuItem value="Freezer">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AcUnit />
                        Freezer
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={selectedLocation}
                    label="Location"
                    onChange={(e) => setSelectedLocation(e.target.value as Location)}
                    required
                    disabled={!selectedFridgeType}
                  >
                    {selectedFridgeType && locations[selectedFridgeType].map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography>Quantity:</Typography>
                  <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Remove />
                  </IconButton>
                  <Typography>{quantity}</Typography>
                  <IconButton onClick={() => setQuantity(quantity + 1)}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Registration Date"
                  name="registerDate"
                  type="date"
                  defaultValue={currentItem?.registered_date || new Date().toISOString().split('T')[0]}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  defaultValue={currentItem?.expiry_date}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="note"
                  multiline
                  rows={3}
                  defaultValue={currentItem?.note}
                />
              </Grid>
            </Grid>
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