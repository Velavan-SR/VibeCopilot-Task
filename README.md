# VibeCo Services Clone

A modern web application that clones the soft services feature from VibeCo Pilot, built with React and Python FastAPI.

## Features

- User authentication
- Service listing
- Detailed service view
- Modern UI with Material-UI
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows
   # or
   source venv/bin/activate     # On Unix or MacOS
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Login with the following credentials:
   - Email: sham@gmail.com
   - Password: 123456
3. Browse through the available services
4. Click on a service to view more details

## Deployment

This application is configured for deployment on Render. The backend uses FastAPI and the frontend is built with Vite, making it easy to deploy.

### Backend Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment on Render

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - React Router
  - Axios

- Backend:
  - FastAPI
  - Python
  - JWT Authentication
  - SQLAlchemy 