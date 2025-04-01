import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Assignment as ChecklistIcon,
  Task as TaskIcon
} from '@mui/icons-material';

const PageNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Paper sx={{ mb: 3, p: 2 }}>
      <Box display="flex" gap={2}>
        <Button
          variant={isActive('/services') ? 'contained' : 'outlined'}
          startIcon={<HomeIcon />}
          onClick={() => navigate('/services')}
        >
          Services
        </Button>
        <Button
          variant={isActive('/checklist') ? 'contained' : 'outlined'}
          startIcon={<ChecklistIcon />}
          onClick={() => navigate('/checklist')}
        >
          Checklists
        </Button>
        <Button
          variant={isActive('/tasks') ? 'contained' : 'outlined'}
          startIcon={<TaskIcon />}
          onClick={() => navigate('/tasks')}
        >
          Tasks
        </Button>
      </Box>
    </Paper>
  );
};

export default PageNavigation; 