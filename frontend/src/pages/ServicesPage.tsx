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

interface Service {
  id: number;
  serviceName: string;
  building: string;
  floor: string;
  unit: string;
  createdBy: string;
  createdOn: string;
}

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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
    fetchServices();
  });

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get<Service[]>('http://localhost:8000/api/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services');
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

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setSelectedService(service);
    } else {
      setSelectedService({
        id: 0,
        serviceName: '',
        building: '',
        floor: '',
        unit: '',
        createdBy: '',
        createdOn: new Date().toISOString()
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
  };

  const handleSaveService = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (selectedService?.id) {
        // Update existing service
        await axios.put(
          `http://localhost:8000/api/services/${selectedService.id}`,
          selectedService,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSnackbar({
          open: true,
          message: 'Service updated successfully',
          severity: 'success'
        });
      } else {
        // Create new service
        await axios.post(
          'http://localhost:8000/api/services',
          selectedService,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSnackbar({
          open: true,
          message: 'Service created successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save service',
        severity: 'error'
      });
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`http://localhost:8000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setServices(services.filter(service => service.id !== id));
      setSnackbar({
        open: true,
        message: 'Service deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete service',
        severity: 'error'
      });
    }
  };

  const filteredServices = services.filter(service =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.floor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.unit.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Typography variant="h4">Services</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Service
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service Name</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.serviceName}</TableCell>
                  <TableCell>{service.building}</TableCell>
                  <TableCell>{service.floor}</TableCell>
                  <TableCell>{service.unit}</TableCell>
                  <TableCell>{service.createdBy}</TableCell>
                  <TableCell>{service.createdOn}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(service)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteService(service.id)}
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
        count={filteredServices.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedService?.id ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Service Name"
              value={selectedService?.serviceName || ''}
              onChange={(e) => setSelectedService(prev => prev ? { ...prev, serviceName: e.target.value } : null)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Building"
              value={selectedService?.building || ''}
              onChange={(e) => setSelectedService(prev => prev ? { ...prev, building: e.target.value } : null)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Floor"
              value={selectedService?.floor || ''}
              onChange={(e) => setSelectedService(prev => prev ? { ...prev, floor: e.target.value } : null)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Unit"
              value={selectedService?.unit || ''}
              onChange={(e) => setSelectedService(prev => prev ? { ...prev, unit: e.target.value } : null)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveService} variant="contained" color="primary">
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

export default ServicesPage;
