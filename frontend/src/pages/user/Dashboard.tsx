import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ShoppingCart,
  Kitchen,
  Restaurant,
  Warning,
  TrendingUp,
  Delete,
} from '@mui/icons-material';
import { dashboardApi } from '../../services/user/api';

interface DashboardData {
  expiringItems: Array<{
    id: number;
    name: string;
    expiryDate: string;
    quantity: number;
    unit: string;
  }>;
  shoppingList: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    completed: boolean;
  }>;
  fridgeItems: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
  }>;
  mealPlans: Array<{
    id: number;
    date: string;
    meals: Array<{
      type: string;
      recipe: {
        id: number;
        name: string;
      };
    }>;
  }>;
  foodPurchases: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    purchaseDate: string;
    price: number;
  }>;
  consumptionTrends: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    consumptionDate: string;
  }>;
  wastedFood: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    wasteDate: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    expiringItems: [],
    shoppingList: [],
    fridgeItems: [],
    mealPlans: [],
    foodPurchases: [],
    consumptionTrends: [],
    wastedFood: []
  });

  const fetchData = async () => {
    try {
      const response = await dashboardApi.getData();
      setData(response.data || {
        expiringItems: [],
        shoppingList: [],
        fridgeItems: [],
        mealPlans: [],
        foodPurchases: [],
        consumptionTrends: [],
        wastedFood: []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data immediately

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = {
    expiringItems: data.expiringItems?.length || 0,
    shoppingList: data.shoppingList?.length || 0,
    fridgeItems: data.fridgeItems?.length || 0,
    mealPlans: data.mealPlans?.length || 0,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Overview
      </Typography>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Typography variant="h6">Expiring Items</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.expiringItems}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Items need attention
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
                <Typography variant="h6">Shopping List</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.shoppingList}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Items to purchase
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
                <Typography variant="h6">Fridge</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.fridgeItems}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Current inventory
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
                <Typography variant="h6">Meal Plans</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.mealPlans}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Planned meals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports and Statistics */}
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Reports & Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Food Purchase Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Food Purchase History"
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ShoppingCart />
                </Avatar>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Food Item</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Purchase Date</TableCell>
                      <TableCell>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.foodPurchases?.length ? (
                      data.foodPurchases.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{`${item.quantity} ${item.unit}`}</TableCell>
                          <TableCell>{new Date(item.purchaseDate).toLocaleDateString()}</TableCell>
                          <TableCell>{item.price.toLocaleString('vi-VN')}đ</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No purchases recorded</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Consumption Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Consumption Trends"
              avatar={
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Food Item</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Consumption Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.consumptionTrends?.length ? (
                      data.consumptionTrends.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{`${item.quantity} ${item.unit}`}</TableCell>
                          <TableCell>{new Date(item.consumptionDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No consumption data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Food Waste Report */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Food Waste Report"
              avatar={
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Delete />
                </Avatar>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Food Item</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Waste Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.wastedFood?.length ? (
                      data.wastedFood.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{`${item.quantity} ${item.unit}`}</TableCell>
                          <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(item.wasteDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No food waste recorded</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 