import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white border border-[#24305E] rounded flex items-center justify-center text-[#24305E] font-bold text-sm">
                ГЭТ
              </div>
              <h1 className="text-[#24305E] font-bold text-lg">
                Электронный журнал
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-[#24305E]">
                  {role === 'admin' && 'Администратор'}
                  {role === 'teacher' && 'Преподаватель'}
                  {role === 'curator' && 'Куратор'}
                  {role === 'student' && 'Студент'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-get-red hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};