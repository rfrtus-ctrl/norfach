import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';

import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import DashboardPage      from './pages/DashboardPage';
import BrowseJobsPage     from './pages/browse/BrowseJobsPage';
import BrowseWorkersPage  from './pages/browse/BrowseWorkersPage';
import ProfilePage        from './pages/ProfilePage';
import SettingsPage       from './pages/SettingsPage';

import JobDetailPage      from './pages/jobs/JobDetailPage';
import JobsPage           from './pages/jobs/JobsPage';
import WorkerDetailPage   from './pages/workers/WorkerDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      <Routes>
        {/* Public auth routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected app routes */}
        <Route element={<AppLayout />}>
          <Route path="/"                   element={<DashboardPage />} />
          <Route path="/browse/jobs"        element={<BrowseJobsPage />} />
          <Route path="/browse/workers"     element={<BrowseWorkersPage />} />
          <Route path="/jobs/:id"           element={<JobDetailPage />} />
          <Route path="/my-jobs"            element={<JobsPage />} />
          <Route path="/workers/:id"        element={<WorkerDetailPage />} />
          <Route path="/profile"            element={<ProfilePage />} />
          <Route path="/settings"           element={<SettingsPage />} />
          <Route path="*"                   element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
