import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { JournalTable } from '../components/JournalTable';

export const StudentView = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Личный кабинет ученика</h2>
        <button onClick={() => { logout(); navigate('/'); }} className="text-gray-500 hover:text-get-red">
          Выйти
        </button>
      </nav>

      <main className="container mx-auto p-4">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-700">
            Здесь вы можете видеть свои оценки и комментарии преподавателей. Редактирование недоступно.
          </p>
        </div>
        {/* Роль student блокирует кнопки "+" в таблице */}
        <JournalTable userRole="student" />
      </main>
    </div>
  );
};