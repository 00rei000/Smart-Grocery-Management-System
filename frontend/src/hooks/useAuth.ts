import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/user/api';

// User data type returned from backend (without password)
interface UserWithoutPassword {
  id: number;
  username: string;
  full_name: string;
  email: string;
  age: number;
  phone_number: string;
  address: string;
  family_id: number;
  created_at: string;
  updated_at: string;
}

// User registration data
interface RegisterData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  age: number;
  phone_number: string;
  address: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithoutPassword | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const user = localStorage.getItem('current_user');
    if (accessToken && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await loginUser({ username, password });
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('current_user', JSON.stringify(response.user));
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      navigate('/');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await registerUser(userData);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
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