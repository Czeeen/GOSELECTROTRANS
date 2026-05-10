import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Импорт только существующих страниц
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentView } from './pages/StudentView';
import { CuratorDashboard } from './pages/CuratorDashboard';

// Компонент защиты маршрутов
const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: string 
}) => {
  const { role } = useAuth();
  
  // Если роль не совпадает или пользователь не авторизован -> редирект на логин
  if (!role || role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публичный роут */}
          <Route path="/" element={<Login />} />
          
          {/* Защищенные роуты по ролям */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/student/*" element={
            <ProtectedRoute allowedRole="student">
              <StudentView />
            </ProtectedRoute>
          } />
          
          <Route path="/curator/*" element={
            <ProtectedRoute allowedRole="curator">
              <CuratorDashboard />
            </ProtectedRoute>
          } />
          
          {/* Запасной роут */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;