import React from 'react';
import { Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1">
        Trang chủ
      </Typography>
    </Container>
  );
} 