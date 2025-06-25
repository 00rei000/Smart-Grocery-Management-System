import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Container,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Restaurant as RestaurantIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Report as ReportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  itemCount: number;
}

interface Recipe {
  id: number;
  name: string;
  category: string;
  status: string;
  author: string;
}

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'Admin', status: 'Active' },
    { id: 2, username: 'user1', email: 'user1@example.com', role: 'User', status: 'Active' },
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Rau củ', description: 'Các loại rau củ quả', itemCount: 50 },
    { id: 2, name: 'Thịt', description: 'Các loại thịt', itemCount: 30 },
  ]);
  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: 1, name: 'Canh chua cá lóc', category: 'Món canh', status: 'Đã duyệt', author: 'user1' },
    { id: 2, name: 'Cơm rang', category: 'Món chính', status: 'Chờ duyệt', author: 'user2' },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'user' | 'category' | 'recipe'>('user');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    name: '',
    description: '',
    category: '',
  });

  const navigate = useNavigate();

  // Dữ liệu mẫu - sau này sẽ lấy từ API
  const stats = {
    totalUsers: 150,
    activeUsers: 120,
    totalCategories: 25,
    pendingApprovals: 5,
    systemPerformance: '98%',
  };

  const recentActivities = [
    { id: 1, action: 'Người dùng mới đăng ký', time: '5 phút trước' },
    { id: 2, action: 'Cập nhật danh mục thực phẩm', time: '10 phút trước' },
    { id: 3, action: 'Phê duyệt công thức mới', time: '15 phút trước' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (type: 'user' | 'category' | 'recipe') => {
    setDialogType(type);
    setFormData({
      username: '',
      email: '',
      role: '',
      name: '',
      description: '',
      category: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý thêm/sửa dữ liệu
    handleCloseDialog();
  };

  const handleDelete = (id: number, type: 'user' | 'category' | 'recipe') => {
    // Xử lý xóa dữ liệu
  };

  const handleRefresh = () => {
    // Cập nhật dữ liệu
    console.log('Refreshing data...');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bảng điều khiển quản trị
        </Typography>
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng số người dùng
                  </Typography>
                  <Typography variant="h5">{stats.totalUsers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Danh mục
                  </Typography>
                  <Typography variant="h5">{stats.totalCategories}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReportIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Chờ phê duyệt
                  </Typography>
                  <Typography variant="h5">{stats.pendingApprovals}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hiệu suất hệ thống
                  </Typography>
                  <Typography variant="h5">{stats.systemPerformance}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Các chức năng chính */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <CardHeader title="Quản lý người dùng" />
            <CardContent>
              <List>
                <ListItem button onClick={() => navigate('/admin/users')}>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Danh sách người dùng"
                    secondary="Quản lý tài khoản người dùng"
                  />
                </ListItem>
                <ListItem button onClick={() => navigate('/admin/users/roles')}>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phân quyền người dùng"
                    secondary="Quản lý vai trò và quyền hạn"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <CardHeader title="Quản lý nội dung" />
            <CardContent>
              <List>
                <ListItem button onClick={() => navigate('/admin/categories')}>
                  <ListItemIcon>
                    <CategoryIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Danh mục thực phẩm"
                    secondary="Quản lý loại thực phẩm và đơn vị tính"
                  />
                </ListItem>
                <ListItem button onClick={() => navigate('/admin/moderation')}>
                  <ListItemIcon>
                    <ReportIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Kiểm duyệt nội dung"
                    secondary="Phê duyệt công thức và bình luận"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      {/* Hoạt động gần đây */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <CardHeader title="Hoạt động gần đây" />
        <CardContent>
          <List>
            {recentActivities.map((activity) => (
              <ListItem key={activity.id}>
                <ListItemText
                  primary={activity.action}
                  secondary={activity.time}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {dialogType === 'user'
              ? 'Thêm/Sửa người dùng'
              : dialogType === 'category'
              ? 'Thêm/Sửa danh mục'
              : 'Thêm/Sửa công thức'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {dialogType === 'user' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên đăng nhập"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Vai trò"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </Grid>
                </>
              )}
              {dialogType === 'category' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên danh mục"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mô tả"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </>
              )}
              {dialogType === 'recipe' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên công thức"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Danh mục"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
} 