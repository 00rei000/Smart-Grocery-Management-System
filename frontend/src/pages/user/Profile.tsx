import React, { useState, useEffect } from 'react';
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
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { familyApi, User } from '../../services/user/api';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    age: '',
    username: '',
    email: '',
    phone: '',
    address: '',
  });

  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
        setCurrentUser(userData);
        setEditFormData({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          address: userData.address || '',
        });

        const response = await familyApi.getAllMembers();
        setFamilyMembers(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Error loading data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
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
      setFormData({
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

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await familyApi.updateMember(editingMember.id.toString(), {
          name: formData.name,
          email: formData.email,
          relationship: formData.relationship,
          age: parseInt(formData.age),
          familyId: currentUser?.family_id.toString() || '',
        });
        setSnackbar({
          open: true,
          message: 'Member updated successfully',
          severity: 'success'
        });
      } else {
        await familyApi.createMember({
          name: formData.name,
          email: formData.email,
          relationship: formData.relationship,
          age: parseInt(formData.age),
          familyId: currentUser?.family_id.toString() || '',
        });
        setSnackbar({
          open: true,
          message: 'Member added successfully',
          severity: 'success'
        });
      }
      const response = await familyApi.getAllMembers();
      setFamilyMembers(response.data);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving member:', error);
      setSnackbar({
        open: true,
        message: 'Error saving member',
        severity: 'error'
      });
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(editFormData)
        });
        
        if (response.ok) {
          const updatedUser = await response.json();
          setCurrentUser(updatedUser);
          localStorage.setItem('current_user', JSON.stringify(updatedUser));
          setSnackbar({
            open: true,
            message: 'Profile updated successfully',
            severity: 'success'
          });
          handleCloseEditDialog();
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
        severity: 'error'
      });
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await familyApi.deleteMember(id.toString());
      setSnackbar({
        open: true,
        message: 'Member deleted successfully',
        severity: 'success'
      });
      const response = await familyApi.getAllMembers();
      setFamilyMembers(response.data);
    } catch (error) {
      console.error('Error deleting member:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting member',
        severity: 'error'
      });
    }
  };

  const handleViewProfile = (member: FamilyMember) => {
    localStorage.setItem('viewingMember', JSON.stringify(member));
    navigate(`/profile/${member.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Personal Information
      </Typography>

      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {currentUser?.full_name?.[0] || 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {currentUser?.full_name || 'User'}
              </Typography>
              <Typography color="text.secondary">
                {currentUser?.email || 'email@example.com'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Username"
                  secondary={currentUser?.username || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone Number"
                  secondary={currentUser?.phone_number || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Address"
                  secondary={currentUser?.address || 'N/A'}
                />
              </ListItem>
            </List>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleOpenEditDialog}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        {/* Family Members List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Family Members
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Member
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
                            {`${member.relationship} - ${member.age} years old`}
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

      {/* Add/Edit Member Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingMember ? 'Edit Member' : 'Add New Member'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingMember ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleEditProfile}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editFormData.phone_number}
                  onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Update</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 