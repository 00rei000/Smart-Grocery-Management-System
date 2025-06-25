import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

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

export default function FamilyMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Lấy thông tin người thân từ localStorage
  const viewingMember = JSON.parse(localStorage.getItem('viewingMember') || '{}') as FamilyMember;

  const handleBack = () => {
    navigate('/profile');
  };

  if (!viewingMember) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Không tìm thấy thông tin người dùng
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Quay lại
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ width: 120, height: 120, mb: 2 }}
            src={viewingMember.avatar}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {viewingMember.name}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {viewingMember.relationship} - {viewingMember.age} tuổi
          </Typography>
          {viewingMember.username && (
            <Typography variant="body2" color="text.secondary">
              @{viewingMember.username}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={viewingMember.email || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Số điện thoại"
                  secondary={viewingMember.phone || 'N/A'}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Địa chỉ"
                  secondary={viewingMember.address || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Quan hệ"
                  secondary={viewingMember.relationship}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
} 