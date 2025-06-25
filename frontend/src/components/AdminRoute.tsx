import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // Lấy thông tin người dùng từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Kiểm tra xem người dùng có phải là admin không
  if (!currentUser || currentUser.role !== 'Admin') {
    // Nếu không phải admin, chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu là admin, hiển thị nội dung
  return <>{children}</>;
};

export default AdminRoute; 