import React, { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import { Edit, Delete, Add, Person } from '@mui/icons-material';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@company.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30'
    },
    {
      id: 2,
      name: 'فاطمة عبدالله',
      email: 'fatima@company.com',
      role: 'analyst',
      status: 'active',
      lastLogin: '2024-01-15 09:15'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      analyst: 'warning',
      viewer: 'info',
      auditor: 'success'
    };
    return colors[role];
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">إدارة المستخدمين</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          مستخدم جديد
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المستخدم</TableCell>
              <TableCell>البريد الإلكتروني</TableCell>
              <TableCell>الدور</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>آخر دخول</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    {user.name}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color={getRoleColor(user.role)}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    size="small" 
                    color={getStatusColor(user.status)}
                  />
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        <DialogContent>
          <UserForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>إلغاء</Button>
          <Button variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const UserForm = () => {
  return (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField fullWidth label="الاسم الكامل" required />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="البريد الإلكتروني" type="email" required />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>الدور</InputLabel>
            <Select label="الدور">
              <MenuItem value="admin">مدير النظام</MenuItem>
              <MenuItem value="analyst">محلل أمني</MenuItem>
              <MenuItem value="viewer">مشاهد</MenuItem>
              <MenuItem value="auditor">مراجع</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserManagement;
