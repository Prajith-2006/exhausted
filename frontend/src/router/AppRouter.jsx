import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import { Login, Register } from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Farms from '../pages/Farms';
import Crops from '../pages/Crops';
import Weather from '../pages/Weather';
import Sensors from '../pages/Sensors';
import PestHistory from '../pages/PestHistory';
import Recommendations from '../pages/Recommendations';
import Alerts from '../pages/Alerts';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import FieldDashboard from '../pages/FieldDashboard';
import DiseaseDiagnosis from '../pages/DiseaseDiagnosis';
import { LoadingSpinner } from '../components/EmptyState';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Authenticating session..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Initializing Smart Farmer Platform..." />;

  return (
    <Routes>
      {/* Public Home Landing Page before Login */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Authenticated Dashboard & Farm Workspace */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/farms" element={<Farms />} />
        <Route path="/crops" element={<Crops />} />
        <Route path="/disease-ai" element={<DiseaseDiagnosis />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/sensors" element={<Sensors />} />
        <Route path="/pests" element={<PestHistory />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/fields/:fieldId" element={<FieldDashboard />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
