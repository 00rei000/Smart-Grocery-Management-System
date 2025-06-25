import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ItemListProps<T> {
  items: T[];
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  renderItemContent: (item: T) => React.ReactNode;
  getItemId: (item: T) => number;
  getItemStatus?: (item: T) => {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  } | null;
}

export function ItemList<T>({
  items,
  onEdit,
  onDelete,
  renderItemContent,
  getItemId,
  getItemStatus,
}: ItemListProps<T>) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={getItemId(item)}>
          <Card>
            <CardContent>
              {getItemStatus && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  {(() => {
                    const status = getItemStatus(item);
                    if (status) {
                      return (
                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                        />
                      );
                    }
                    return null;
                  })()}
                </Box>
              )}
              {renderItemContent(item)}
              {(onEdit || onDelete) && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  {onEdit && (
                    <IconButton onClick={() => onEdit(item)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton onClick={() => onDelete(getItemId(item))}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// Utility function để tạo nội dung mặc định cho một mục trong danh sách
export const createDefaultItemContent = (
  title: string,
  details: { label: string; value: string | number }[]
) => (
  <>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {details.map(({ label, value }) => (
      <Typography key={label} color="textSecondary">
        {label}: {value}
      </Typography>
    ))}
  </>
); 