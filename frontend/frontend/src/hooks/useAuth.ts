import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

interface UserWithoutPassword {
  username: string;
  fullName: string;
  email: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithoutPassword | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const user = localStorage.getItem('currentUser');
    if (auth === 'true' && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const login = (username: string, password: string) => {
    // Kiểm tra đăng nhập với tài khoản admin mặc định
    if (username === 'admin' && password === 'admin') {
      const user: UserWithoutPassword = { 
        username, 
        fullName: 'Admin', 
        email: 'admin@example.com' 
      };
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      setIsAuthenticated(true);
      setCurrentUser(user);
      navigate('/');
      return true;
    }

    // Kiểm tra đăng nhập với tài khoản thường
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setIsAuthenticated(true);
      setCurrentUser(userWithoutPassword);
      navigate('/');
      return true;
    }

    return false;
  };

  const register = (userData: User) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    
    // Kiểm tra username đã tồn tại
    if (users.some(u => u.username === userData.username)) {
      return false;
    }

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  return {
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
  };
} 