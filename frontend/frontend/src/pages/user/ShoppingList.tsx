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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Paper,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  addedBy: string;
  addedAt: string;
  status: 'pending' | 'bought';
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export default function ShoppingList() {
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const savedItems = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    return savedItems;
  });
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const familyMembers = JSON.parse(localStorage.getItem('familyMembers') || '[]') as FamilyMember[];

  const handleAddItem = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      addedBy: currentUser.email,
      addedAt: new Date().toISOString(),
      status: 'pending',
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem('shoppingList', JSON.stringify(updatedItems));
    setOpenDialog(false);
    setError(null);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem('shoppingList', JSON.stringify(updatedItems));
  };

  const handleToggleStatus = (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id
        ? { ...item, status: item.status === 'pending' ? ('bought' as const) : ('pending' as const) }
        : item
    );
    setItems(updatedItems);
    localStorage.setItem('shoppingList', JSON.stringify(updatedItems));
  };

  const filteredItems = selectedMember === 'all'
    ? items
    : items.filter(item => item.addedBy === selectedMember);

  const getMemberName = (email: string) => {
    const member = familyMembers.find((m: FamilyMember) => m.email === email);
    return member ? member.name : email;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Danh sách Mua sắm
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Lọc theo thành viên</InputLabel>
              <Select
                value={selectedMember}
                label="Lọc theo thành viên"
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {familyMembers.map((member: FamilyMember) => (
                  <MenuItem key={member.id} value={member.email}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Thêm mục mới
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <List>
          {filteredItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemIcon>
                  <IconButton
                    edge="end"
                    aria-label="toggle status"
                    onClick={() => handleToggleStatus(item.id)}
                    color={item.status === 'bought' ? 'success' : 'default'}
                  >
                    <CheckIcon />
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <Box>
                      <Typography component="span" variant="body2">
                        {item.quantity} {item.unit}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={`Thêm bởi: ${getMemberName(item.addedBy)}`}
                          icon={<ShareIcon />}
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
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="quantity"
                  label="Số lượng"
                  type="number"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="unit"
                  label="Đơn vị"
                  type="text"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              Thêm
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 