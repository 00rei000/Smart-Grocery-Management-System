import React from 'react';
import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
  Avatar,
} from '@mui/material';
import {
  ShoppingCart,
  Kitchen,
  Restaurant,
  Event,
  Warning,
  CheckCircle,
  LocalGroceryStore,
  FoodBank,
} from '@mui/icons-material';

// Dữ liệu mẫu
const mockData = {
  expiringItems: [
    {
      id: 1,
      name: 'Sữa tươi',
      expiryDate: '2024-05-05',
      quantity: 2,
      unit: 'hộp',
    },
    {
      id: 2,
      name: 'Thịt bò',
      expiryDate: '2024-05-06',
      quantity: 500,
      unit: 'gram',
    },
  ],
  shoppingList: [
    {
      id: 1,
      name: 'Rau cải',
      quantity: 1,
      unit: 'bó',
      completed: false,
    },
    {
      id: 2,
      name: 'Trứng gà',
      quantity: 10,
      unit: 'quả',
      completed: true,
    },
  ],
  fridgeItems: [
    {
      id: 1,
      name: 'Cà chua',
      quantity: 5,
      unit: 'quả',
    },
    {
      id: 2,
      name: 'Thịt heo',
      quantity: 1,
      unit: 'kg',
    },
  ],
  mealPlans: [
    {
      id: 1,
      date: '2024-05-01',
      meals: [
        {
          type: 'Sáng',
          recipe: {
            id: 1,
            name: 'Bánh mì trứng',
          },
        },
        {
          type: 'Trưa',
          recipe: {
            id: 2,
            name: 'Cơm gà',
          },
        },
      ],
    },
  ],
};

const Dashboard: React.FC = () => {
  const stats = {
    expiringItems: mockData.expiringItems.length,
    shoppingList: mockData.shoppingList.length,
    fridgeItems: mockData.fridgeItems.length,
    mealPlans: mockData.mealPlans.length,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tổng quan
      </Typography>

      {/* Thống kê */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Typography variant="h6">Sắp hết hạn</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.expiringItems}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Sản phẩm sắp hết hạn
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ShoppingCart />
                </Avatar>
                <Typography variant="h6">Danh sách mua sắm</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.shoppingList}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Món cần mua
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Kitchen />
                </Avatar>
                <Typography variant="h6">Tủ lạnh</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.fridgeItems}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Sản phẩm trong tủ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Restaurant />
                </Avatar>
                <Typography variant="h6">Kế hoạch bữa ăn</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.mealPlans}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Bữa ăn đã lên kế hoạch
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chi tiết */}
      <Grid container spacing={3}>
        {/* Sản phẩm sắp hết hạn */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Sản phẩm sắp hết hạn"
              avatar={
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Warning />
                </Avatar>
              }
            />
            <CardContent>
              <List>
                {mockData.expiringItems.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      secondary={`Hết hạn: ${new Date(item.expiryDate).toLocaleDateString()} - ${item.quantity} ${item.unit}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Danh sách mua sắm */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Danh sách mua sắm"
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ShoppingCart />
                </Avatar>
              }
            />
            <CardContent>
              <List>
                {mockData.shoppingList.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      {item.completed ? (
                        <CheckCircle color="success" />
                      ) : (
                        <LocalGroceryStore />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} ${item.unit}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Tủ lạnh */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Tủ lạnh"
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Kitchen />
                </Avatar>
              }
            />
            <CardContent>
              <List>
                {mockData.fridgeItems.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      <FoodBank />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} ${item.unit}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Kế hoạch bữa ăn */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Kế hoạch bữa ăn"
              avatar={
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Restaurant />
                </Avatar>
              }
            />
            <CardContent>
              <List>
                {mockData.mealPlans.map((plan) => (
                  <ListItem key={plan.id}>
                    <ListItemIcon>
                      <Event />
                    </ListItemIcon>
                    <ListItemText
                      primary={new Date(plan.date).toLocaleDateString()}
                      secondary={plan.meals
                        .map((meal) => `${meal.type}: ${meal.recipe.name}`)
                        .join(', ')}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
//thanh
export default Dashboard; 