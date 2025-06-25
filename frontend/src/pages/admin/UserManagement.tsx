import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  age?: number;
  is_admin: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    age: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Memoize getToken and refreshToken
  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      throw new Error('No refresh token found. Please log in again.');
    }
    try {
      const response = await fetch('http://localhost:8000/users/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      throw error;
    }
  }, []);

  const getToken = useCallback(async () => {
    let token = localStorage.getItem('access_token');
    if (!token) {
      token = await refreshToken();
    }
    return token;
  }, [refreshToken]);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        const response = await fetch('http://localhost:8000/users/user-manage/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text.startsWith('<!DOCTYPE') ? 'Received HTML instead of JSON, likely authentication error' : `HTTP ${response.status}: ${text}`);
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        alert(`Không thể tải danh sách người dùng: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [getToken]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        age: user.age ? String(user.age) : '',
        password: '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        full_name: '',
        email: '',
        phone_number: '',
        age: '',
        password: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email || !formData.username) {
      alert('Tên đăng nhập, họ và tên, email là bắt buộc');
      return;
    }
    if (!selectedUser && !formData.password) {
      alert('Mật khẩu là bắt buộc khi tạo mới');
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      let method = selectedUser ? 'PUT' : 'POST';
      // Không gửi password khi cập nhật nếu để trống
      const payload: any = {
        ...(selectedUser && { user_id: selectedUser.id }),
        ...formData,
        age: formData.age ? Number(formData.age) : null,
      };
      if (selectedUser && !formData.password) {
        delete payload.password;
      }
      const response = await fetch('http://localhost:8000/users/user-manage/', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(text.startsWith('<!DOCTYPE') ? 'Received HTML instead of JSON, likely authentication error' : `HTTP ${response.status}: ${text}`);
        }
        throw new Error(errorData.detail || 'Failed to save user');
      }
      const updatedUser: User = await response.json();
      if (selectedUser) {
        setUsers(users.map(user => (user.id === selectedUser.id ? updatedUser : user)));
      } else {
        setUsers([...users, updatedUser]);
      }
      handleCloseDialog();
      if(selectedUser) {
        alert('Cập nhật người dùng thành công');
      }
      else {
        alert('Thêm người dùng thành công');
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(`Không thể lưu thông tin người dùng: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const token = await getToken();
        const response = await fetch('http://localhost:8000/users/user-manage/', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });
        if (!response.ok) {
          const text = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch {
            throw new Error(text.startsWith('<!DOCTYPE') ? 'Received HTML instead of JSON, likely authentication error' : `HTTP ${response.status}: ${text}`);
          }
          throw new Error(errorData.detail || 'Failed to delete user');
        }
        setUsers(users.filter(user => user.id !== userId));
      } catch (error: any) {
        console.error('Error deleting user:', error);
        alert(`Không thể xóa người dùng: ${error.message}`);
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  // Calculate paginated users
  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý người dùng
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Thêm người dùng
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Tuổi</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone_number || 'Chưa cập nhật'}</TableCell>
                <TableCell>{user.age ?? 'Chưa cập nhật'}</TableCell>
                <TableCell>{user.is_admin ? 'Admin' : 'Home Cook'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Tên đăng nhập"
              value={formData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, username: e.target.value })
              }
              fullWidth
              required
              disabled={!!selectedUser}
            />
            <TextField
              label="Họ và tên"
              value={formData.full_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Số điện thoại"
              value={formData.phone_number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Tuổi"
              type="number"
              value={formData.age}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, age: e.target.value })
              }
              fullWidth
            />
            {!selectedUser && (
              <TextField
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                fullWidth
                required
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Đang lưu...' : selectedUser ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}