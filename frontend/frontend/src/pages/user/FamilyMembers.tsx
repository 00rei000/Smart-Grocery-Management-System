import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export default function FamilyMembers() {
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const savedMembers = JSON.parse(localStorage.getItem('familyMembers') || '[]');
    // Nếu chưa có thành viên nào, tạo nhóm với người dùng hiện tại là admin
    if (savedMembers.length === 0 && currentUser.username) {
      const initialMembers = [{
        id: Date.now().toString(),
        name: currentUser.fullName || currentUser.username,
        email: currentUser.email || '',
        role: 'admin' as const,
      }];
      localStorage.setItem('familyMembers', JSON.stringify(initialMembers));
      return initialMembers;
    }
    return savedMembers;
  });

  const handleAddMember = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: 'member' as const,
    };

    // Kiểm tra email đã tồn tại chưa
    if (members.some(m => m.email === newMember.email)) {
      setError('Email đã được sử dụng');
      return;
    }

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
    setOpenDialog(false);
    setError(null);
  };

  const handleDeleteMember = (id: string) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const memberToDelete = members.find(m => m.id === id);
    
    // Không cho phép xóa chính mình
    if (memberToDelete?.email === currentUser.email) {
      setError('Không thể xóa chính mình');
      return;
    }

    const updatedMembers = members.filter(m => m.id !== id);
    setMembers(updatedMembers);
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
    setError(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý Thành viên Gia đình
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Thêm thành viên
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <List>
          {members.map((member, index) => (
            <React.Fragment key={member.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary={member.name}
                  secondary={`${member.email} (${member.role === 'admin' ? 'Quản trị viên' : 'Thành viên'})`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleAddMember}>
          <DialogTitle>Thêm thành viên mới</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Họ và tên"
              type="text"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email"
              type="email"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              Thêm
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 