import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: number;
  serviceName: string;
  building: string;
  floor: string;
  unit: string;
  createdBy: string;
  createdOn: string;
}

const ServicesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/services', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [navigate]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) navigate('/checklist');
    if (newValue === 2) navigate('/tasks');
  };

  const filteredServices = services.filter(service =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="service tabs"
            >
              <Tab label="Service" />
              <Tab label="Checklist" />
              <Tab label="Task" />
            </Tabs>
          </Box>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search By Service name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
            />
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mr: 1 }}
              >
                Add
              </Button>
              <Button
                variant="contained"
                startIcon={<QrCodeIcon />}
                sx={{ mr: 1 }}
              >
                QR Code
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
              >
                Export
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">ACTION</TableCell>
                  <TableCell>SERVICE NAME</TableCell>
                  <TableCell>BUILDING</TableCell>
                  <TableCell>FLOOR</TableCell>
                  <TableCell>UNIT</TableCell>
                  <TableCell>CREATED BY</TableCell>
                  <TableCell>CREATED ON</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((service) => (
                    <TableRow
                      hover
                      key={service.id}
                    >
                      <TableCell padding="checkbox">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{service.serviceName}</TableCell>
                      <TableCell>{service.building}</TableCell>
                      <TableCell>{service.floor}</TableCell>
                      <TableCell>{service.unit}</TableCell>
                      <TableCell>{service.createdBy}</TableCell>
                      <TableCell>{service.createdOn}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredServices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default ServicesPage; 