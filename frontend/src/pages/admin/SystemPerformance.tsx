import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

interface SystemMetric {
  name: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface PerformanceLog {
  id: number;
  timestamp: string;
  metric: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
}

export default function SystemPerformance() {
  const [metrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: '45%',
      change: -2.5,
      icon: <SpeedIcon />,
      color: '#2196f3',
    },
    {
      name: 'Memory Usage',
      value: '3.2GB/8GB',
      change: 0.8,
      icon: <MemoryIcon />,
      color: '#4caf50',
    },
    {
      name: 'Disk Space',
      value: '256GB/512GB',
      change: -1.2,
      icon: <StorageIcon />,
      color: '#ff9800',
    },
    {
      name: 'Response Time',
      value: '120ms',
      change: -5.0,
      icon: <TimerIcon />,
      color: '#f44336',
    },
  ]);

  const [performanceLogs] = useState<PerformanceLog[]>([
    {
      id: 1,
      timestamp: '2024-03-15 10:30:00',
      metric: 'CPU Usage',
      value: '75%',
      status: 'warning',
    },
    {
      id: 2,
      timestamp: '2024-03-15 10:29:00',
      metric: 'Memory Usage',
      value: '4.5GB/8GB',
      status: 'normal',
    },
    {
      id: 3,
      timestamp: '2024-03-15 10:28:00',
      metric: 'Response Time',
      value: '250ms',
      status: 'critical',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleRefresh = () => {
    // Cập nhật dữ liệu từ API
    console.log('Refreshing system metrics...');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Hiệu suất hệ thống
        </Typography>
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Chỉ số hệ thống */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: `${metric.color}20`,
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {React.cloneElement(metric.icon as React.ReactElement, {
                      sx: { color: metric.color },
                    })}
                  </Box>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {metric.name}
                    </Typography>
                    <Typography variant="h5">{metric.value}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {metric.change > 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={metric.change > 0 ? 'success.main' : 'error.main'}
                    sx={{ ml: 0.5 }}
                  >
                    {Math.abs(metric.change)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Biểu đồ hiệu suất */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <CardHeader title="CPU & Memory Usage" />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">
                  Biểu đồ CPU & Memory Usage sẽ được hiển thị ở đây
                </Typography>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <CardHeader title="Disk Space" />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">
                  Biểu đồ Disk Space sẽ được hiển thị ở đây
                </Typography>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      {/* Log hiệu suất */}
      <Paper sx={{ p: 2 }}>
        <CardHeader title="Log hiệu suất gần đây" />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thời gian</TableCell>
                <TableCell>Chỉ số</TableCell>
                <TableCell>Giá trị</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.metric}</TableCell>
                  <TableCell>{log.value}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status}
                      color={getStatusColor(log.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
} 