import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { KycReview } from './pages/KycReview';
import { Properties } from './pages/Properties';
import { Financials } from './pages/Financials';
import { AgentPerformance } from './pages/AgentPerformance';
import { Tickets } from './pages/Tickets';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="performance" element={<AgentPerformance />} />
            <Route path="agents" element={<Agents />} />
            <Route path="kyc" element={<KycReview />} />
            <Route path="properties" element={<Properties />} />
            <Route path="financials" element={<Financials />} />
            <Route path="tickets" element={<Tickets />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

