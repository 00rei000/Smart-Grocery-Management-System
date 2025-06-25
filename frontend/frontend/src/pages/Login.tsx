import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra đăng nhập
    if (username === '3' && password === '3') {
      // Tài khoản admin mẫu
      const adminUser = {
        id: 3,
        username: '3',
        fullName: '3',
        email: '3@gmail.com',
        role: 'Admin',
        status: 'Active'
      };
      console.log('Đăng nhập với tài khoản admin:', adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else if (username && password) {
      // Tài khoản người dùng thường
      const normalUser = {
        id: 2,
        username: username,
        fullName: 'Người dùng',
        email: `${username}@example.com`,
        role: 'User',
        status: 'Active'
      };
      console.log('Đăng nhập với tài khoản thường:', normalUser);
      localStorage.setItem('currentUser', JSON.stringify(normalUser));
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Đăng nhập
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Đăng nhập
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{ textDecoration: 'none' }}
              >
                Chưa có tài khoản? Đăng ký ngay
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
} 