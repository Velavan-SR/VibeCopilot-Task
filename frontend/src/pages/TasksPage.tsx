import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: number;
  serviceName: string;
  checklistName: string;
  startDate: string;
  status: string;
  assignedTo: string;
}

const TasksPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(2);
  const [filterValue, setFilterValue] = useState('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
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
    if (newValue === 1) navigate('/checklist');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.checklistName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterValue === 'all') return matchesSearch;
    return matchesSearch && task.status === filterValue;
  });

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

          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                >
                  <FormControlLabel value="all" control={<Radio />} label="All" />
                  <FormControlLabel value="pending" control={<Radio />} label="Pending" />
                  <FormControlLabel value="completed" control={<Radio />} label="Completed" />
                  <FormControlLabel value="overdue" control={<Radio />} label="Overdue" />
                </RadioGroup>
              </FormControl>
              <TextField
                size="small"
                placeholder="Search By name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 300 }}
              />
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">ACTION</TableCell>
                    <TableCell>SERVICE NAME</TableCell>
                    <TableCell>CHECKLIST NAME</TableCell>
                    <TableCell>START DATE</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>ASSIGNED TO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
                      <TableRow
                        hover
                        key={task.id}
                      >
                        <TableCell padding="checkbox">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>{task.serviceName}</TableCell>
                        <TableCell>{task.checklistName}</TableCell>
                        <TableCell>{task.startDate}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTasks.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TasksPage; 