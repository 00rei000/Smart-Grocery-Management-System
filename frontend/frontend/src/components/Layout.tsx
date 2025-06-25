import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  ListItemButton,
  useTheme,
  useMediaQuery,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Kitchen as KitchenIcon,
  Restaurant as RestaurantIcon,
  MenuBook as MenuBookIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarMonthIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

export default function Layout() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItems, setMenuItems] = useState([
    { text: 'Trang chủ', icon: <DashboardIcon />, path: '/' },
    { text: 'Danh sách mua sắm', icon: <ShoppingCartIcon />, path: '/shopping-list' },
    { text: 'Tủ lạnh', icon: <KitchenIcon />, path: '/inventory' },
    { text: 'Kế hoạch bữa ăn', icon: <CalendarMonthIcon />, path: '/meal-planner' },
    { text: 'Công thức nấu ăn', icon: <RestaurantIcon />, path: '/recipes' },
    { text: 'Thành viên gia đình', icon: <PeopleIcon />, path: '/family-members' },
    { text: 'Hồ sơ', icon: <PersonIcon />, path: '/profile' },
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Lấy thông tin người dùng từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Cập nhật menu khi currentUser thay đổi
  useEffect(() => {
    const baseMenuItems = [
      { text: 'Trang chủ', icon: <DashboardIcon />, path: '/' },
      { text: 'Danh sách mua sắm', icon: <ShoppingCartIcon />, path: '/shopping-list' },
      { text: 'Tủ lạnh', icon: <KitchenIcon />, path: '/inventory' },
      { text: 'Kế hoạch bữa ăn', icon: <CalendarMonthIcon />, path: '/meal-planner' },
      { text: 'Công thức nấu ăn', icon: <RestaurantIcon />, path: '/recipes' },
      { text: 'Thành viên gia đình', icon: <PeopleIcon />, path: '/family-members' },
      { text: 'Hồ sơ', icon: <PersonIcon />, path: '/profile' },
    ];

    // Thêm nút Admin nếu người dùng là admin
    if (currentUser.role === 'Admin') {
      baseMenuItems.push({ text: 'Quản trị', icon: <AdminPanelSettingsIcon />, path: '/admin' });
    }

    setMenuItems(baseMenuItems);
  }, [currentUser.role]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateToProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    handleMenuClose();
    navigate('/login');
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        px: [1],
      }}>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.path);
              }}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  display: open ? 'block' : 'none'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Hệ thống Quản lý Thực phẩm Thông minh
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              startIcon={<Avatar sx={{ width: 32, height: 32 }}>{currentUser.fullName?.[0] || 'U'}</Avatar>}
              onClick={handleMenuOpen}
              sx={{ textTransform: 'none' }}
            >
              {currentUser.fullName || 'Người dùng'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" noWrap>
                  {currentUser.fullName || 'Người dùng'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {currentUser.email || 'email@example.com'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleNavigateToProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Thông tin cá nhân
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Cài đặt
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: open ? drawerWidth : theme.spacing(7) },
          flexShrink: { sm: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: open ? drawerWidth : theme.spacing(7),
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open={open}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : theme.spacing(7)}px)` },
          ml: { sm: open ? 0 : `${theme.spacing(7)}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
} 