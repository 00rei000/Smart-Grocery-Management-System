import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openRegister, setOpenRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
  username: '',
  password: '',
  full_name: '',
  email: '',
  age: 18,
  phone_number: '',
  address: '',
  });
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
  const success = await login(username,password);
  if (success) {
    console.log('Login successful');
    const currentUser = localStorage.getItem('current_user');
   if(currentUser && JSON.parse(currentUser).is_admin === true) {
    navigate('/admin/users');
   }
   else navigate('/');
  } else {
    setError('Invalid username or password');
  }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegisterError(null);

  const success = await register(registerData);
  if (success) {
    setOpenRegister(false);
    await login(registerData.username, registerData.password);
  } else {
    setRegisterError('Username already exists');
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
            Login
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
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
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
              Login
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setOpenRegister(true)}
              >
                Don't have an account? Register now
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>

      <Dialog open={openRegister} onClose={() => setOpenRegister(false)}>
        <form onSubmit={handleRegister}>
          <DialogTitle>Register New Account</DialogTitle>
          <DialogContent>
            {registerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {registerError}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Username"
                  value={registerData.username}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, username: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  value={registerData.full_name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, full_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                />
              </Grid>
                <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Age"
                  type="number"
                  value={registerData.age}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, age: Number(e.target.value) })
                  }
                />
              </Grid>
                <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  type='tel'
                  value={registerData.phone_number}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone_number: e.target.value })
                  }
                />
              </Grid>
                <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  value={registerData.address}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, address: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRegister(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Register
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}