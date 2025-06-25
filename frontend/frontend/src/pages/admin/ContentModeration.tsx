import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  postId: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function ContentModeration() {
  const [currentTab, setCurrentTab] = useState(0);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: 'Công thức nấu canh chua cá lóc',
      content: 'Hướng dẫn chi tiết cách nấu canh chua cá lóc ngon...',
      author: 'user1',
      category: 'Món canh',
      status: 'pending',
      createdAt: '2024-03-15',
    },
    {
      id: 2,
      title: 'Cách chọn thịt tươi ngon',
      content: 'Một số mẹo nhỏ để chọn được thịt tươi ngon...',
      author: 'user2',
      category: 'Mẹo vặt',
      status: 'approved',
      createdAt: '2024-03-14',
    },
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      content: 'Công thức rất hay, cảm ơn bạn đã chia sẻ!',
      author: 'user3',
      postId: 1,
      status: 'pending',
      createdAt: '2024-03-15',
    },
    {
      id: 2,
      content: 'Mình đã thử và rất thành công!',
      author: 'user4',
      postId: 2,
      status: 'approved',
      createdAt: '2024-03-14',
    },
  ]);

  const [selectedContent, setSelectedContent] = useState<Post | Comment | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleViewContent = (content: Post | Comment) => {
    setSelectedContent(content);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedContent(null);
    setRejectReason('');
  };

  const handleApprove = (id: number, type: 'post' | 'comment') => {
    if (type === 'post') {
      setPosts(posts.map(post =>
        post.id === id ? { ...post, status: 'approved' } : post
      ));
    } else {
      setComments(comments.map(comment =>
        comment.id === id ? { ...comment, status: 'approved' } : comment
      ));
    }
    handleCloseDialog();
  };

  const handleReject = (id: number, type: 'post' | 'comment') => {
    if (type === 'post') {
      setPosts(posts.map(post =>
        post.id === id ? { ...post, status: 'rejected' } : post
      ));
    } else {
      setComments(comments.map(comment =>
        comment.id === id ? { ...comment, status: 'rejected' } : comment
      ));
    }
    handleCloseDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Kiểm duyệt nội dung
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Bài đăng" />
          <Tab label="Bình luận" />
        </Tabs>
      </Paper>

      {currentTab === 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Tác giả</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.id}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>{post.createdAt}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.status}
                      color={getStatusColor(post.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewContent(post)}>
                      <VisibilityIcon />
                    </IconButton>
                    {post.status === 'pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(post.id, 'post')}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleReject(post.id, 'post')}
                        >
                          <CloseIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nội dung</TableCell>
                <TableCell>Tác giả</TableCell>
                <TableCell>Bài đăng</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>{comment.id}</TableCell>
                  <TableCell>{comment.content}</TableCell>
                  <TableCell>{comment.author}</TableCell>
                  <TableCell>{comment.postId}</TableCell>
                  <TableCell>{comment.createdAt}</TableCell>
                  <TableCell>
                    <Chip
                      label={comment.status}
                      color={getStatusColor(comment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewContent(comment)}>
                      <VisibilityIcon />
                    </IconButton>
                    {comment.status === 'pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(comment.id, 'comment')}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleReject(comment.id, 'comment')}
                        >
                          <CloseIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedContent && 'post' in selectedContent
            ? 'Chi tiết bài đăng'
            : 'Chi tiết bình luận'}
        </DialogTitle>
        <DialogContent>
          {selectedContent && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                {'title' in selectedContent ? (
                  <>
                    <Typography variant="h6">{selectedContent.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Tác giả: {selectedContent.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Danh mục: {selectedContent.category}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      {selectedContent.content}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body1">{selectedContent.content}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Tác giả: {selectedContent.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bài đăng ID: {selectedContent.postId}
                    </Typography>
                  </>
                )}
              </CardContent>
              {selectedContent.status === 'pending' && (
                <CardActions>
                  <Button
                    startIcon={<CheckIcon />}
                    color="success"
                    onClick={() =>
                      handleApprove(
                        selectedContent.id,
                        'title' in selectedContent ? 'post' : 'comment'
                      )
                    }
                  >
                    Phê duyệt
                  </Button>
                  <Button
                    startIcon={<CloseIcon />}
                    color="error"
                    onClick={() =>
                      handleReject(
                        selectedContent.id,
                        'title' in selectedContent ? 'post' : 'comment'
                      )
                    }
                  >
                    Từ chối
                  </Button>
                </CardActions>
              )}
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
