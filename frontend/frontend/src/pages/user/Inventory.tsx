import React, { useState } from 'react';
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
  Icecream,
  AcUnit,
} from '@mui/icons-material';
import { InventoryItem } from '../../types';

// Dữ liệu mẫu
const mockItems: InventoryItem[] = [
  {
    id: 1,
    name: 'Rau cải',
    category: 'Rau củ',
    fridgeType: 'Ngăn mát',
    location: 'Ngăn rau củ',
    quantity: 2,
    registerDate: '2024-05-01',
    expiryDate: '2024-05-07',
    note: 'Rau tươi mới mua'
  },
  {
    id: 2,
    name: 'Thịt bò',
    category: 'Thịt',
    fridgeType: 'Tủ đông',
    location: 'Ngăn trên',
    quantity: 1,
    registerDate: '2024-05-01',
    expiryDate: '2024-05-15',
    note: 'Thịt bò Mỹ'
  },
  {
    id: 3,
    name: 'Sữa tươi',
    category: 'Sữa',
    fridgeType: 'Ngăn mát',
    location: 'Cánh cửa trên',
    quantity: 3,
    registerDate: '2024-05-01',
    expiryDate: '2024-05-10',
    note: 'Sữa Vinamilk'
  }
];

// Danh sách thể loại thực phẩm và icon tương ứng
const categories = {
  'Rau củ': LocalFlorist,
  'Trái cây': Restaurant,
  'Thịt': LocalDining,
  'Cá': LocalPizza,
  'Sữa': LocalDrink,
  'Đồ uống': EmojiFoodBeverage,
  'Đồ khô': LocalGroceryStore,
  'Gia vị': Cake,
  'Khác': Egg,
} as const;

type Category = keyof typeof categories;

// Danh sách vị trí trong tủ lạnh
const locations = {
  'Ngăn mát': [
    'Cánh cửa trên',
    'Cánh cửa dưới',
    'Ngăn rau củ',
    'Ngăn giữa',
    'Ngăn dưới'
  ],
  'Tủ đông': [
    'Ngăn trên',
    'Ngăn giữa',
    'Ngăn dưới'
  ]
} as const;

type FridgeType = keyof typeof locations;
type Location = typeof locations[FridgeType][number];

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>(mockItems);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Rau củ');
  const [selectedLocation, setSelectedLocation] = useState<Location>('Cánh cửa trên');
  const [selectedFridgeType, setSelectedFridgeType] = useState<FridgeType>('Ngăn mát');
  const [quantity, setQuantity] = useState(1);
  const [selectedFridgeView, setSelectedFridgeView] = useState<FridgeType>('Ngăn mát');

  const handleAddItem = () => {
    setCurrentItem(null);
    setOpenDialog(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setCurrentItem(item);
    setSelectedCategory(item.category as Category);
    setSelectedLocation(item.location as Location);
    setSelectedFridgeType(item.fridgeType);
    setQuantity(item.quantity);
    setOpenDialog(true);
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSaveItem = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const itemData: Omit<InventoryItem, 'id'> = {
      name: formData.get('name') as string,
      category: selectedCategory,
      fridgeType: selectedFridgeType,
      location: selectedLocation,
      quantity: quantity,
      registerDate: formData.get('registerDate') as string,
      expiryDate: formData.get('expiryDate') as string,
      note: formData.get('note') as string,
    };

    if (currentItem) {
      setItems(items.map(item => 
        item.id === currentItem.id ? { ...itemData, id: currentItem.id } : item
      ));
    } else {
      const newId = Math.max(...items.map(item => item.id), 0) + 1;
      setItems([...items, { ...itemData, id: newId }]);
    }

    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCategory('Rau củ');
    setSelectedLocation('Cánh cửa trên');
    setSelectedFridgeType('Ngăn mát');
    setQuantity(1);
  };

  const filteredItems = items.filter((item: InventoryItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNearExpiryItems = (days: number) => {
    const today = new Date();
    return items.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days && diffDays >= 0;
    });
  };

  const nearExpiryItems = getNearExpiryItems(3);

  const getItemStatus = (item: InventoryItem) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );

    if (daysUntilExpiry <= 0) {
      return { label: 'Đã hết hạn', color: 'error' as const };
    }
    if (daysUntilExpiry <= 3) {
      return { label: 'Sắp hết hạn', color: 'warning' as const };
    }
    return { label: 'Còn hạn', color: 'success' as const };
  };

  // Lọc thực phẩm theo ngăn
  const fridgeItems = items.filter((item: InventoryItem) => item.fridgeType === selectedFridgeView);
  
  // Nhóm thực phẩm theo thể loại
  const groupedItems = fridgeItems.reduce((acc: Partial<Record<Category, InventoryItem[]>>, item: InventoryItem) => {
    const category = item.category as Category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category]?.push(item);
    return acc;
  }, {} as Partial<Record<Category, InventoryItem[]>>);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý Tủ lạnh
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tìm kiếm thực phẩm"
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
              Thêm thực phẩm mới
            </Button>
          </Grid>
        </Grid>
      </Box>

      {nearExpiryItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Có {nearExpiryItems.length} món sắp hết hạn trong 3 ngày tới!
        </Alert>
      )}

      {/* Chọn ngăn tủ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card 
            onClick={() => setSelectedFridgeView('Ngăn mát')}
            sx={{ 
              cursor: 'pointer',
              bgcolor: selectedFridgeView === 'Ngăn mát' ? 'primary.light' : 'background.paper'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Kitchen fontSize="large" />
                <Typography variant="h6">Ngăn mát</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card 
            onClick={() => setSelectedFridgeView('Tủ đông')}
            sx={{ 
              cursor: 'pointer',
              bgcolor: selectedFridgeView === 'Tủ đông' ? 'primary.light' : 'background.paper'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AcUnit fontSize="large" />
                <Typography variant="h6">Tủ đông</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hiển thị thực phẩm theo ngăn */}
      <Card>
        <CardHeader
          title={selectedFridgeView}
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {selectedFridgeView === 'Ngăn mát' ? <Kitchen /> : <AcUnit />}
            </Avatar>
          }
        />
        <CardContent>
          {Object.entries(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, items]) => {
              const Icon = categories[category as Category];
              return (
                <Box key={category} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Icon sx={{ mr: 1 }} />
                    <Typography variant="h6">{category}</Typography>
                  </Box>
                  <List>
                    {(items as InventoryItem[]).map((item: InventoryItem) => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          <Icon />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.quantity} cái - HSD: ${new Date(item.expiryDate).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider />
                </Box>
              );
            })
          ) : (
            <Typography color="text.secondary" align="center">
              {selectedFridgeView} rỗng
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleSaveItem}>
          <DialogTitle>
            {currentItem ? 'Chỉnh sửa thực phẩm' : 'Thêm thực phẩm mới'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên thực phẩm"
                  name="name"
                  defaultValue={currentItem?.name}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Thể loại</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Thể loại"
                    onChange={(e) => setSelectedCategory(e.target.value as Category)}
                    required
                  >
                    {Object.keys(categories).map((category) => {
                      const Icon = categories[category as Category];
                      return (
                        <MenuItem key={category} value={category}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon />
                            {category}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Loại tủ</InputLabel>
                  <Select
                    value={selectedFridgeType}
                    label="Loại tủ"
                    onChange={(e) => setSelectedFridgeType(e.target.value as FridgeType)}
                    required
                  >
                    <MenuItem value="Ngăn mát">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Kitchen />
                        Ngăn mát
                      </Box>
                    </MenuItem>
                    <MenuItem value="Tủ đông">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AcUnit />
                        Tủ đông
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vị trí</InputLabel>
                  <Select
                    value={selectedLocation}
                    label="Vị trí"
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
                  <Typography>Số lượng:</Typography>
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
                  label="Ngày đăng ký"
                  name="registerDate"
                  type="date"
                  defaultValue={currentItem?.registerDate || new Date().toISOString().split('T')[0]}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hạn sử dụng"
                  name="expiryDate"
                  type="date"
                  defaultValue={currentItem?.expiryDate}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi chú"
                  name="note"
                  multiline
                  rows={3}
                  defaultValue={currentItem?.note}
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