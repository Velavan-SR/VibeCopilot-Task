import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageNavigation from '../components/PageNavigation';

interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  checklistId: number;
}

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [checklists, setChecklists] = useState<{ id: number; name: string }[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchTasks();
    fetchChecklists();
  });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get<Task[]>('http://localhost:8000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklists = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get<{ id: number; name: string }[]>('http://localhost:8000/api/checklists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChecklists(response.data);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(_event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
    } else {
      setSelectedTask({
        id: 0,
        name: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: '',
        assignedTo: '',
        checklistId: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (selectedTask?.id) {
        // Update existing task
        await axios.put(
          `http://localhost:8000/api/tasks/${selectedTask.id}`,
          selectedTask,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSnackbar({
          open: true,
          message: 'Task updated successfully',
          severity: 'success'
        });
      } else {
        // Create new task
        await axios.post(
          'http://localhost:8000/api/tasks',
          selectedTask,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSnackbar({
          open: true,
          message: 'Task created successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save task',
        severity: 'error'
      });
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`http://localhost:8000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(tasks.filter(task => task.id !== id));
      setSnackbar({
        open: true,
        message: 'Task deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete task',
        severity: 'error'
      });
    }
  };

  const filteredTasks = tasks.filter(task =>
    (task.name?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
    (task.description?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
    (task.status?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
    (task.priority?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
    (task.assignedTo?.toLowerCase() || '').includes((searchTerm || '').toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <PageNavigation />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tasks</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Task
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Checklist</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>{task.assignedTo}</TableCell>
                  <TableCell>
                    {checklists.find(c => c.id === task.checklistId)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(task)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredTasks.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTask?.id ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={selectedTask?.name || ''}
              onChange={(e) => setSelectedTask(prev => prev ? { ...prev, name: e.target.value } : null)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={selectedTask?.description || ''}
              onChange={(e) => setSelectedTask(prev => prev ? { ...prev, description: e.target.value } : null)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedTask?.status || 'Pending'}
                onChange={(e) => setSelectedTask(prev => prev ? { ...prev, status: e.target.value } : null)}
                label="Status"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={selectedTask?.priority || 'Medium'}
                onChange={(e) => setSelectedTask(prev => prev ? { ...prev, priority: e.target.value } : null)}
                label="Priority"
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={selectedTask?.dueDate || ''}
              onChange={(e) => setSelectedTask(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Assigned To"
              value={selectedTask?.assignedTo || ''}
              onChange={(e) => setSelectedTask(prev => prev ? { ...prev, assignedTo: e.target.value } : null)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Checklist</InputLabel>
              <Select
                value={selectedTask?.checklistId || ''}
                onChange={(e) => setSelectedTask(prev => prev ? { ...prev, checklistId: Number(e.target.value) } : null)}
                label="Checklist"
              >
                {checklists.map(checklist => (
                  <MenuItem key={checklist.id} value={checklist.id}>
                    {checklist.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TasksPage;
