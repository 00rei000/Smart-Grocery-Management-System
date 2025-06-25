import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Paper,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  GroupAdd as GroupAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { familyApi } from '../../services/user/api';
import CustomSnackbar from '../../components/CustomSnackbar'; 

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: string;
  age: number;
  avatar?: string;
  username?: string;
  phone?: string;
  address?: string;
  family: string;
  related_to_name: string;
  related_to_email:string;
}

interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
}

export default function FamilyMembers() {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openFamilyDialog, setOpenFamilyDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [openEditFamilyDialog, setOpenEditFamilyDialog] = useState(false);
  const [openEditMemberDialog, setOpenEditMemberDialog] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    relationship: '',
    age: 0,
    familyId: ''
  });


useEffect(() => {
  fetchData();
}, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [familiesResponse, membersResponse] = await Promise.all([
        familyApi.getAllFamilies(),
        familyApi.getAllMembers()
      ]);
      setFamilies(familiesResponse.data);
      setMembers(membersResponse.data);
      console.log("members:", membersResponse.data)
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      setSnackbar({ open: true, message: 'Không thể tải dữ liệu', severity: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      setError('Family name is required');
      setSnackbar({ open: true, message: 'Tên gia đình là bắt buộc', severity: 'error' });
      return;
    }

    try {
      const response = await familyApi.createFamily({ name: familyName });
      setFamilies([...families, response.data]);
      setOpenFamilyDialog(false);
      setFamilyName('');
      setError(null);
      setSnackbar({ open: true, message: 'Tạo gia đình thành công', severity: 'success' });
    } catch (err) {
      setError('Failed to create family');
      setSnackbar({ open: true, message: 'Không thể tạo gia đình', severity: 'error' });
      console.error(err);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email.trim() || !newMember.relationship.trim() || !selectedFamily) {
      setError('All fields are required');
      setSnackbar({ open: true, message: 'Vui lòng nhập đủ thông tin', severity: 'error' });
      return;
    }

    try {
      const response = await familyApi.createMember({
        ...newMember,
        familyId: selectedFamily
      });
      
      setMembers([...members, response.data]);
      
      // Update family members
      const updatedFamilies = families.map(family => {
        if (family.id === selectedFamily) {
          return {
            ...family,
            members: Array.isArray(family.members)
              ? [...family.members, response.data]
              : [response.data]
          };
        }
        return family;
      });
      setFamilies(updatedFamilies);
      
      setOpenMemberDialog(false);
      setNewMember({
        name: '',
        email: '',
        relationship: '',
        age: 0,
        familyId: ''
      });
      setSelectedFamily('');
      setError(null);
      setSnackbar({ open: true, message: 'Thêm thành viên thành công', severity: 'success' });
    } catch (err) {
      setError('Failed to add member');
      console.error(err);
      setSnackbar({ open: true, message: 'Không thể thêm thành viên', severity: 'error' });
    }
  };

  const handleEditFamily = async () => {
    if (!familyName.trim()) {
      setError('Family name is required');
      setSnackbar({ open: true, message: 'Tên gia đình là bắt buộc', severity: 'error' });
      return;
    }

    if (editingFamily) {
      try {
        const response = await familyApi.updateFamily(editingFamily.id, { name: familyName });
        const updatedFamilies = families.map(family => 
          family.id === editingFamily.id 
            ? response.data
            : family
        );
        setFamilies(updatedFamilies);
        setOpenEditFamilyDialog(false);
        setEditingFamily(null);
        setFamilyName('');
        setError(null);
        setSnackbar({ open: true, message: 'Cập nhật gia đình thành công', severity: 'success' });
      } catch (err) {
        setError('Failed to update family');
        setSnackbar({ open: true, message: 'Không thể cập nhật gia đình', severity: 'error' });
        console.error(err);
      }
    }
  };

  const handleDeleteFamily = async (familyId: string) => {
    try {
      await familyApi.deleteFamily(familyId);
      const updatedFamilies = families.map(family => ({
        ...family,
        members: Array.isArray(family.members)
        ? family.members.filter(member => member.family !== familyId)
        : []
      }));
      const updatedMembers = members.filter(member => member.family !== familyId);
      setFamilies(updatedFamilies);
      setMembers(updatedMembers);
      setError(null);
      setSnackbar({ open: true, message: 'Xóa gia đình thành công', severity: 'success' });
    } catch (err) {
      setError('Failed to delete family');
      setSnackbar({ open: true, message: 'Không thể xóa gia đình', severity: 'error' });
      console.error(err);
    }
  };

  const handleEditMember = async () => {
    if (!newMember.relationship.trim() || !newMember.familyId) {
      setError('All fields are required');
      setSnackbar({ open: true, message: 'Vui lòng nhập đủ thông tin', severity: 'error' });
      return;
    }

    if (editingMember) {
      try {
        const response = await familyApi.updateMember(editingMember.id, newMember);
        const updatedMembers = members.map(member =>
          member.id === editingMember.id
            ? response.data
            : member
        );
        setMembers(updatedMembers);

        // Update family members
        const updatedFamilies = families.map(family => {
          if (family.id === selectedFamily) {
            return {
              ...family,
              members: Array.isArray(family.members)
                ? [...family.members, response.data]
                : [response.data]
            };
          }
          return family;
        });
        setFamilies(updatedFamilies);

        setOpenEditMemberDialog(false);
        setEditingMember(null);
        setNewMember({
          name: '',
          email: '',
          relationship: '',
          age: 0,
          familyId: ''
        });
        setError(null);
        setSnackbar({ open: true, message: 'Cập nhật thành viên thành công', severity: 'success' });
      } catch (err) {
        setError('Failed to update member');
        setSnackbar({ open: true, message: 'Không thể cập nhật thành viên', severity: 'error' });
        console.error(err);
      }
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await familyApi.deleteMember(memberId);
      const updatedMembers = members.filter(member => member.id !== memberId);
      setMembers(updatedMembers);

      // Update family members
      const updatedFamilies = families.map(family => ({
        ...family,
        members: Array.isArray(family.members)
          ? family.members.filter(member => member.id !== memberId)
          : []
      }));
      setFamilies(updatedFamilies);
      setError(null);
      setSnackbar({ open: true, message: 'Xóa thành viên thành công', severity: 'success' });
    } catch (err) {
      setError('Failed to delete member');
      setSnackbar({ open: true, message: 'Không thể xóa thành viên', severity: 'error' });
      console.error(err);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddFamilyClick = () => {
    handleMenuClose();
    setOpenFamilyDialog(true);
  };

  const handleAddMemberClick = () => {
    handleMenuClose();
    setOpenMemberDialog(true);
  };

  const handleFamilyMenuClick = (event: React.MouseEvent<HTMLElement>, family: Family) => {
    setAnchorEl(event.currentTarget);
    setEditingFamily(family);
  };

  const handleMemberMenuClick = (event: React.MouseEvent<HTMLElement>, memberId: string) => {
    setMemberMenuAnchor(event.currentTarget);
    setSelectedMemberId(memberId);
    const member = members.find(m => m.id === memberId);
    if (member) {
      setEditingMember(member);
      setNewMember({
        name: member.name,
        email: member.email,
        relationship: member.relationship,
        age: member.age,
        familyId: member.family
      });
    }
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchor(null);
    setSelectedMemberId('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Family Members</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<GroupAddIcon />}
            onClick={handleMenuClick}
          >
            Family Actions
          </Button>
          <Menu 
            anchorEl={anchorEl} 
            open={Boolean(anchorEl)} 
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleAddFamilyClick}>
              <AddIcon sx={{ mr: 1 }} /> Add Family
            </MenuItem>
            <MenuItem onClick={handleAddMemberClick}>
              <GroupAddIcon sx={{ mr: 1 }} /> Add Member
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {families.map(family => (
        <Paper key={family.id} sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{family.name}</Typography>
            <IconButton onClick={(e) => handleFamilyMenuClick(e, family)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          <List>
            {members
              .filter(member => member.family === family.id)
              .map((member, index) => (
                <React.Fragment key={member.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={(e) => handleMemberMenuClick(e, member.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={member.related_to_name}
                      secondary={`${member.related_to_email} - ${member.relationship}`}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
          </List>
        </Paper>
      ))}

      {/* Family Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl) && Boolean(editingFamily)} 
        onClose={() => {
          setAnchorEl(null);
          setEditingFamily(null);
        }}
      >
        <MenuItem onClick={() => {
          setAnchorEl(null);
          setFamilyName(editingFamily?.name || '');
          setOpenEditFamilyDialog(true);
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit Family
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null);
          if (editingFamily) {
            handleDeleteFamily(editingFamily.id);
          }
        }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Family
        </MenuItem>
      </Menu>

      {/* Member Menu */}
      <Menu 
        anchorEl={memberMenuAnchor} 
        open={Boolean(memberMenuAnchor)} 
        onClose={handleMemberMenuClose}
      >
        <MenuItem onClick={() => {
          handleMemberMenuClose();
          setOpenEditMemberDialog(true);
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit Member
        </MenuItem>
        <MenuItem onClick={() => {
          handleMemberMenuClose();
          handleDeleteMember(selectedMemberId);
        }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Member
        </MenuItem>
      </Menu>

      {/* Add Family Dialog */}
      <Dialog open={openFamilyDialog} onClose={() => setOpenFamilyDialog(false)}>
        <DialogTitle>Create New Family</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Family Name"
            type="text"
            fullWidth
            variant="standard"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFamilyDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFamily} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)}>
  <DialogTitle>Thêm thành viên mới</DialogTitle>
  <DialogContent>
    <FormControl fullWidth margin="dense">
      <InputLabel>Chọn gia đình</InputLabel>
      <Select
        value={selectedFamily}
        onChange={(e) => setSelectedFamily(e.target.value)}
        required
      >
        {families.map(family => (
          <MenuItem key={family.id} value={family.id}>
            {family.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <TextField
      margin="dense"
      label="Email thành viên"
      type="email"
      fullWidth
      value={newMember.email}
      onChange={e => setNewMember({ ...newMember, email: e.target.value })}
      required
      sx={{ mt: 2 }}
    />
    <TextField
      margin="dense"
      label="Quan hệ"
      type="text"
      fullWidth
      value={newMember.relationship}
      onChange={e => setNewMember({ ...newMember, relationship: e.target.value })}
      required
      sx={{ mt: 2 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => {
      setOpenMemberDialog(false);
      setNewMember({
        name:"",
        email: '',
        relationship: '',
        age: 0,
        familyId: ''
      });
      setSelectedFamily('');
      setError(null);
    }}>Hủy</Button>
    <Button
      onClick={handleAddMember}
      variant="contained"
    >
      Thêm
    </Button>
  </DialogActions>
</Dialog>

      {/* Edit Family Dialog */}
      <Dialog open={openEditFamilyDialog} onClose={() => setOpenEditFamilyDialog(false)}>
        <DialogTitle>Edit Family</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Family Name"
            type="text"
            fullWidth
            variant="standard"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditFamilyDialog(false)}>Cancel</Button>
          <Button onClick={handleEditFamily} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={openEditMemberDialog} onClose={() => setOpenEditMemberDialog(false)}>
  <DialogTitle>Edit Member</DialogTitle>
  <DialogContent>
    <FormControl fullWidth margin="dense">
      <InputLabel>Select Family</InputLabel>
      <Select
        value={newMember.familyId}
        onChange={(e) => setNewMember({ ...newMember, familyId: e.target.value })}
      >
        {families.map(family => (
          <MenuItem key={family.id} value={family.id}>
            {family.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <TextField
      margin="dense"
      label="Relationship"
      type="text"
      fullWidth
      value={newMember.relationship}
      onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEditMemberDialog(false)}>Cancel</Button>
    <Button onClick={handleEditMember} variant="contained">Save</Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}