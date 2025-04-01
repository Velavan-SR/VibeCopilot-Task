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

interface Checklist {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  priorityLevel: string;
  frequency: string;
  noOfGroups: number;
  associations: string;
}

const ChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
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
    fetchChecklists();
  });

  const fetchChecklists = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get<Checklist[]>('http://localhost:8000/api/checklists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChecklists(response.data);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      setError('Failed to fetch checklists');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(_event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (checklist?: Checklist) => {
    if (checklist) {
      setSelectedChecklist(checklist);
    } else {
      setSelectedChecklist({
        id: 0,
        name: '',
        startDate: '',
        endDate: '',
        priorityLevel: '',
        frequency: '',
        noOfGroups: 1,
        associations: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedChecklist(null);
  };

  const handleSaveChecklist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (selectedChecklist?.id) {
        // Update existing checklist
        await axios.put(
          `http://localhost:8000/api/checklists/${selectedChecklist.id}`,
          selectedChecklist,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSnackbar({
          open: true,
          message: 'Checklist updated successfully',
          severity: 'success'
        });
      } else {
        // Create new checklist
        await axios.post(
          'http://localhost:8000/api/checklists',
          selectedChecklist,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSnackbar({
          open: true,
          message: 'Checklist created successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchChecklists();
    } catch (error) {
      console.error('Error saving checklist:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save checklist',
        severity: 'error'
      });
    }
  };

  const handleDeleteChecklist = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`http://localhost:8000/api/checklists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChecklists(checklists.filter(checklist => checklist.id !== id));
      setSnackbar({
        open: true,
        message: 'Checklist deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting checklist:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete checklist',
        severity: 'error'
      });
    }
  };

  const filteredChecklists = checklists.filter(checklist =>
    checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.priorityLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.frequency.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Typography variant="h4">Checklists</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Checklist
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search checklists..."
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
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Priority Level</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>No. of Groups</TableCell>
              <TableCell>Associations</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChecklists
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((checklist) => (
                <TableRow key={checklist.id}>
                  <TableCell>{checklist.name}</TableCell>
                  <TableCell>{checklist.startDate}</TableCell>
                  <TableCell>{checklist.endDate}</TableCell>
                  <TableCell>{checklist.priorityLevel}</TableCell>
                  <TableCell>{checklist.frequency}</TableCell>
                  <TableCell>{checklist.noOfGroups}</TableCell>
                  <TableCell>{checklist.associations}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(checklist)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteChecklist(checklist.id)}
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
        count={filteredChecklists.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedChecklist?.id ? 'Edit Checklist' : 'Add New Checklist'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={selectedChecklist?.name || ''}
              onChange={(e) => setSelectedChecklist(prev => prev ? { ...prev, name: e.target.value } : null)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={selectedChecklist?.startDate || ''}
              onChange={(e) => setSelectedChecklist(prev => prev ? { ...prev, startDate: e.target.value } : null)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={selectedChecklist?.endDate || ''}
              onChange={(e) => setSelectedChecklist(prev => prev ? { ...prev, endDate: e.target.value } : null)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority Level</InputLabel>
              <Select
                value={selectedChecklist?.priorityLevel || ''}
                onChange={(e) => setSelectedChecklist(prev => prev ? { ...prev, priorityLevel: e.target.value } : null)}
                label="Priority Level"
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Frequency</InputLabel>
              <Select
                value={selectedChecklist?.frequency || ''}
                onChange={(e) => setSelectedChecklist(prev => prev ? { ...prev, frequency: e.target.value } : null)}
                label="Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="half yearly">Half Yearly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Number of Groups"
              type="number"
              value={selectedChecklist?.noOfGroups || 1}
              onChange={(e) => setSelectedChecklist(prev => prev ? { ...prev, noOfGroups: parseInt(e.target.value) } : null)}
              margin="normal"
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              label="Associations"
              value={selectedChecklist?.associations || ''}
              onChange={(e) => setSelectedChecklist(prev => prev ? { ...prev, associations: e.target.value } : null)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveChecklist} variant="contained" color="primary">
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

export default ChecklistPage; 