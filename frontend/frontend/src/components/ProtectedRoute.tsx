import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  console.log('Current path:', location.pathname);
  console.log('Is authenticated:', isAuthenticated);

  // Cho phép truy cập các trang admin mà không cần đăng nhập
  if (location.pathname.startsWith('/admin')) {
    console.log('Accessing admin page, allowing access');
    return <>{children}</>;
  }

  // Các trang khác vẫn yêu cầu đăng nhập
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('Authenticated, allowing access');
  return <>{children}</>;
} 