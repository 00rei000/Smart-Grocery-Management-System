import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  age: number;
  avatar?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  // Lấy thông tin người dùng từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { 
      id: 1, 
      name: 'Nguyễn Văn A', 
      relationship: 'Vợ', 
      age: 30,
      username: 'nguyenvana',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      address: 'Hà Nội'
    },
    { 
      id: 2, 
      name: 'Nguyễn Thị B', 
      relationship: 'Con gái', 
      age: 5,
      username: 'nguyenthib',
      email: 'nguyenthib@example.com',
      phone: '0987654321',
      address: 'Hà Nội'
    },
  ]);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [userFormData, setUserFormData] = useState({
    fullName: currentUser.fullName || '',
    email: currentUser.email || '',
    username: currentUser.username || '',
    phone: currentUser.phone || '',
    address: currentUser.address || '',
  });
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    relationship: '',
    age: '',
    username: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleOpenDialog = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member);
      setMemberFormData({
        name: member.name,
        relationship: member.relationship,
        age: member.age.toString(),
        username: member.username || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
      });
    } else {
      setEditingMember(null);
      setMemberFormData({
        name: '',
        relationship: '',
        age: '',
        username: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMember(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setFamilyMembers(members =>
        members.map(member =>
          member.id === editingMember.id
            ? {
                ...member,
                name: memberFormData.name,
                relationship: memberFormData.relationship,
                age: parseInt(memberFormData.age),
                username: memberFormData.username,
                email: memberFormData.email,
                phone: memberFormData.phone,
                address: memberFormData.address,
              }
            : member
        )
      );
    } else {
      setFamilyMembers(members => [
        ...members,
        {
          id: Date.now(),
          name: memberFormData.name,
          relationship: memberFormData.relationship,
          age: parseInt(memberFormData.age),
          username: memberFormData.username,
          email: memberFormData.email,
          phone: memberFormData.phone,
          address: memberFormData.address,
        },
      ]);
    }
    handleCloseDialog();
  };

  const handleDeleteMember = (id: number) => {
    setFamilyMembers(members => members.filter(member => member.id !== id));
  };

  const handleViewProfile = (member: FamilyMember) => {
    // Lưu thông tin người thân vào localStorage để xem
    localStorage.setItem('viewingMember', JSON.stringify(member));
    navigate(`/profile/${member.id}`);
  };

  const handleOpenUserDialog = () => {
    setUserFormData({
      fullName: currentUser.fullName || '',
      email: currentUser.email || '',
      username: currentUser.username || '',
      phone: currentUser.phone || '',
      address: currentUser.address || '',
    });
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      ...userFormData,
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    handleCloseUserDialog();
    window.location.reload(); // Reload để cập nhật UI
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Thông tin cá nhân
      </Typography>

      <Grid container spacing={3}>
        {/* Thông tin người dùng */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ width: 120, height: 120, mb: 2 }}
                src={currentUser.avatar}
              >
                {currentUser.fullName?.[0] || 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {currentUser.fullName || 'Người dùng'}
              </Typography>
              <Typography color="text.secondary">
                {currentUser.email || 'email@example.com'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Tên đăng nhập"
                  secondary={currentUser.username || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Số điện thoại"
                  secondary={currentUser.phone || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Địa chỉ"
                  secondary={currentUser.address || 'N/A'}
                />
              </ListItem>
            </List>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleOpenUserDialog}
            >
              Chỉnh sửa thông tin
            </Button>
          </Paper>
        </Grid>

        {/* Danh sách thành viên gia đình */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Thành viên gia đình
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Thêm thành viên
              </Button>
            </Box>
            <List>
              {familyMembers.map((member, index) => (
                <React.Fragment key={member.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          aria-label="view"
                          onClick={() => handleViewProfile(member)}
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenDialog(member)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.name}
                      secondary={
                        <Box>
                          <Typography component="span" variant="body2">
                            {`${member.relationship} - ${member.age} tuổi`}
                          </Typography>
                          {member.username && (
                            <Chip
                              size="small"
                              label={`@${member.username}`}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog thêm/chỉnh sửa thành viên */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quan hệ"
                  value={memberFormData.relationship}
                  onChange={(e) => setMemberFormData({ ...memberFormData, relationship: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tuổi"
                  type="number"
                  value={memberFormData.age}
                  onChange={(e) => setMemberFormData({ ...memberFormData, age: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên đăng nhập"
                  value={memberFormData.username}
                  onChange={(e) => setMemberFormData({ ...memberFormData, username: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={memberFormData.email}
                  onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={memberFormData.phone}
                  onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={memberFormData.address}
                  onChange={(e) => setMemberFormData({ ...memberFormData, address: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingMember ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog chỉnh sửa thông tin cá nhân */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleUserSubmit}>
          <DialogTitle>
            Chỉnh sửa thông tin cá nhân
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên đăng nhập"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={userFormData.address}
                  onChange={(e) => setUserFormData({ ...userFormData, address: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUserDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              Cập nhật
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 