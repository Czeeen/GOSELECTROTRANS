import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { JournalTable } from '../components/JournalTable';

export const TeacherDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-get-red rounded flex items-center justify-center text-white font-bold">Гэт</div>
          <h2 className="text-xl font-semibold text-gray-800">Панель преподавателя</h2>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-get-red hover:bg-red-50 rounded-md transition-colors"
        >
          Выйти
        </button>
      </nav>

      <main className="container mx-auto">
        {/* Передаем роль teacher, чтобы разрешить редактирование */}
        <JournalTable userRole="teacher" />
      </main>
    </div>
  );
};