import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ThemeProvider } from './theme/ThemeProvider';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
// import CategoryManager from './pages/admin/CategoryManager';
import ContentModeration from './pages/admin/ContentModeration';
import SystemPerformance from './pages/admin/SystemPerformance';


// Lazy load các components
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const ShoppingList = lazy(() => import('./pages/user/ShoppingList'));
const Inventory = lazy(() => import('./pages/user/Inventory'));
const MealPlanner = lazy(() => import('./pages/user/MealPlanner'));
const Recipes = lazy(() => import('./pages/user/Recipes'));
const Login = lazy(() => import('./pages/Login'));
const FamilyMembers = lazy(() => import('./pages/user/FamilyMembers'));
const Profile = lazy(() => import('./pages/user/Profile'));
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager'));

// Tạo QueryClient với các cấu hình mặc định
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      gcTime: 10 * 60 * 1000, // 10 phút
      refetchOnWindowFocus: false,
    },
  },
});

// Component loading
const LoadingScreen = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="shopping-list" element={<ShoppingList />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="meal-planner" element={<MealPlanner />} />
                <Route path="recipes" element={<Recipes />} />
                <Route path="family-members" element={<FamilyMembers />} />
                <Route path="profile" element={<Profile />} />
                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/categories" element={<CategoryManager />} />
                <Route path="/admin/moderation" element={<ContentModeration />} />
                <Route path="/admin/performance" element={<SystemPerformance />} />{/* Admin routes */}
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;