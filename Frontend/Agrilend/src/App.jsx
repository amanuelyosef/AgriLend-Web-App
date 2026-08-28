import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import Branding from './components/Branding.jsx';
import LoginCard from './components/LoginCard.jsx';
import AppLayout from './components/AppLayout.jsx';
import DashboardPage from './components/Dashboard.jsx';
import LoanApplication from './components/LoanApplication.jsx';
import NewLoanApplication from './components/NewLoanApplication.jsx';
import ApplicationDetail from './components/ApplicationDetail.jsx';
import SearchFarmers from './components/SearchFarmers.jsx';
import RiskHeatmapPage from './components/RiskHeatmapPage.jsx';
import PortfolioPage from './components/PortfolioPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';

function LoginScreen() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen bg-[#F9FAF1] flex items-center justify-center text-xs text-gray-400">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:flex w-[40%] xl:w-[35%] bg-[#1A532E] p-12 lg:p-16 flex-col justify-between text-white shrink-0">
        <Branding />
      </div>

      <div className="flex-1 min-h-screen bg-[#F9FAF1] relative flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] z-10">
          <LoginCard onLoginSuccess={() => navigate('/')} />
        </div>
      </div>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xs text-gray-400">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/applications"
        element={
          <Protected>
            <AppLayout>
              <LoanApplication />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/applications/new"
        element={
          <Protected>
            <AppLayout>
              <NewLoanApplication />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/applications/:applicationId"
        element={
          <Protected>
            <AppLayout>
              <ApplicationDetail />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/farmers"
        element={
          <Protected>
            <AppLayout>
              <SearchFarmers />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/heatmap"
        element={
          <Protected>
            <AppLayout>
              <RiskHeatmapPage />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/portfolio"
        element={
          <Protected>
            <AppLayout>
              <PortfolioPage />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
