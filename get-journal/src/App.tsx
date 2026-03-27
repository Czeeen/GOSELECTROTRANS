import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentView } from './pages/StudentView';
import { CuratorDashboard } from './pages/CuratorDashboard';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const { role } = useAuth();
  if (role !== allowedRole) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <AdminPanel />
        </ProtectedRoute>
      } />
      <Route path="/teacher" element={
        <ProtectedRoute allowedRole="teacher">
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student" element={
        <ProtectedRoute allowedRole="student">
          <StudentView />
        </ProtectedRoute>
      } />
      <Route path="/curator" element={
        <ProtectedRoute allowedRole="curator">
          <CuratorDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;