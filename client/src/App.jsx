import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPages from './pages/AuthPages';
import DashboardOverview from './pages/DashboardOverview';
import EligibilityForm from './pages/EligibilityForm';
import SavedSchemes from './pages/SavedSchemes';
import Downloads from './pages/Downloads';
import ChatAssistant from './pages/ChatAssistant';
import ProfilePage from './pages/ProfilePage';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import Applications from './pages/Applications';

// Protected Route Wrapper (Redirects to Login if no active token)
const ProtectedLayout = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)'
      }}>
        <div className="skeleton" style={{ width: '150px', height: '30px' }} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

// Main App Router Setup
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Auth pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPages initialMode="login" />} />
        <Route path="/signup" element={<AuthPages initialMode="signup" />} />
        <Route path="/forgot-password" element={<AuthPages initialMode="forgot" />} />

        {/* Protected Dashboard Panels */}
        <Route path="/dashboard" element={<ProtectedLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="eligibility" element={<EligibilityForm />} />
          <Route path="applications" element={<Applications />} />
          <Route path="saved" element={<SavedSchemes />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="chat" element={<ChatAssistant />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        {/* Fallback redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
