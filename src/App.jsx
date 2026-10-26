import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useFactoryStore from './store/factoryStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppShell from './components/AppShell';
import OverviewPage from './pages/OverviewPage';
import MonitoringPage from './pages/MonitoringPage';
import ProduksiPage from './pages/ProduksiPage';
import MESPage from './pages/MESPage';
import ERPPage from './pages/ERPPage';
import EventPage from './pages/EventPage';
import PengaturanPage from './pages/PengaturanPage';
import PredictiveMaintenancePage from './pages/PredictiveMaintenancePage';
import ProductionForecastingPage from './pages/ProductionForecastingPage';
import ReportsPage from './pages/ReportsPage';
import { DataProvider } from './store/DataProviderContext';
import './index.css';

function ProtectedRoute({ children, allowedRoles }) {
  const auth = useFactoryStore(s => s.auth);
  if (!auth.isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(auth.role)) return <Navigate to="/app/overview" replace />;
  return children;
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="predictive-maintenance" element={<PredictiveMaintenancePage />} />
            <Route path="produksi" element={<ProduksiPage />} />
            <Route path="forecasting" element={
              <ProtectedRoute allowedRoles={['SUPERVISOR']}>
                <ProductionForecastingPage />
              </ProtectedRoute>
            } />
            <Route path="mes" element={
              <ProtectedRoute allowedRoles={['SUPERVISOR']}>
                <MESPage />
              </ProtectedRoute>
            } />
            <Route path="erp" element={
              <ProtectedRoute allowedRoles={['SUPERVISOR']}>
                <ERPPage />
              </ProtectedRoute>
            } />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="events" element={<EventPage />} />
            <Route path="pengaturan" element={<PengaturanPage />} />
            {/* Redirect any legacy removed routes to overview */}
            <Route path="energy" element={<Navigate to="/app/overview" replace />} />
            <Route path="vision" element={<Navigate to="/app/overview" replace />} />
            <Route path="digital-twin" element={<Navigate to="/app/overview" replace />} />
            <Route path="network-diagnostics" element={<Navigate to="/app/overview" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
