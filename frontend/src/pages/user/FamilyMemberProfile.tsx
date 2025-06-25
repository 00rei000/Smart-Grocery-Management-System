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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { familyApi } from '../../services/user/api';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  avatar?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  familyId: string;
}

export default function FamilyMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        const response = await familyApi.getAllMembers();
        const foundMember = response.data.find((m: FamilyMember) => m.id === id);
        if (foundMember) {
          setMember(foundMember);
        } else {
          setError('Member not found');
        }
      } catch (err) {
        setError('Failed to load member data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMemberData();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/family-members');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !member) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'User information not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back
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
        Back
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ width: 120, height: 120, mb: 2 }}
            src={member.avatar}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {member.name}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {member.relationship} - {member.age} years old
          </Typography>
          {member.username && (
            <Typography variant="body2" color="text.secondary">
              @{member.username}
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
                  secondary={member.email || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone Number"
                  secondary={member.phone || 'N/A'}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Address"
                  secondary={member.address || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Relationship"
                  secondary={member.relationship}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
} 