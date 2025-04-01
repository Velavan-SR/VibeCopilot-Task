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
  Chip,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const ChecklistPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(1);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/checklists', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChecklists(response.data);
      } catch (error) {
        console.error('Error fetching checklists:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
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
    if (newValue === 0) navigate('/services');
    if (newValue === 2) navigate('/tasks');
  };

  const filteredChecklists = checklists.filter(checklist =>
    checklist.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              placeholder="Search By name"
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
                  <TableCell>NAME</TableCell>
                  <TableCell>START DATE</TableCell>
                  <TableCell>END DATE</TableCell>
                  <TableCell>PRIORITY LEVEL</TableCell>
                  <TableCell>FREQUENCY</TableCell>
                  <TableCell>NO. OF GROUPS</TableCell>
                  <TableCell>ASSOCIATIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChecklists
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((checklist) => (
                    <TableRow
                      hover
                      key={checklist.id}
                    >
                      <TableCell padding="checkbox">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small">
                          <ContentCopyIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{checklist.name}</TableCell>
                      <TableCell>{checklist.startDate}</TableCell>
                      <TableCell>{checklist.endDate}</TableCell>
                      <TableCell>{checklist.priorityLevel}</TableCell>
                      <TableCell>{checklist.frequency}</TableCell>
                      <TableCell>{checklist.noOfGroups}</TableCell>
                      <TableCell>
                        <Chip
                          label={checklist.associations}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredChecklists.length}
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

export default ChecklistPage; 