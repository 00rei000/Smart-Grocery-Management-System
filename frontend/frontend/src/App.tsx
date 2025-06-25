import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagerment';
import CategoryManager from './pages/admin/CategoryManager';
import ContentModeration from './pages/admin/ContentModeration';
import SystemPerformance from './pages/admin/SystemPerformance';

// Lazy load các components
const Home = lazy(() => import('./pages/Home'));
const Recipes = lazy(() => import('./pages/user/Recipes'));
const FamilyMembers = lazy(() => import('./pages/user/FamilyMembers'));
const Profile = lazy(() => import('./pages/user/Profile'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  console.log('App component rendered');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/categories" element={<CategoryManager />} />
          <Route path="/admin/moderation" element={<ContentModeration />} />
          <Route path="/admin/performance" element={<SystemPerformance />} />

          {/* Protected user routes */}
          <Route path="/user" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="recipes" element={<Recipes />} />
            <Route path="family-members" element={<FamilyMembers />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App; 