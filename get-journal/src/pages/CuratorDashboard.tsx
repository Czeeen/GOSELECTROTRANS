import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CuratorDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Отчеты куратора</h1>
            <p className="text-gray-500">Мониторинг успеваемости и стипендиальный фонд</p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="btn-get py-2 px-6">
            Выйти
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-green-600 text-sm font-bold uppercase">Стипендиаты</div>
            <div className="text-3xl font-black">12</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="text-get-red text-sm font-bold uppercase">Должники</div>
            <div className="text-3xl font-black">3</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-gray-600 text-sm font-bold uppercase">Средний балл группы</div>
            <div className="text-3xl font-black">4.2</div>
          </div>
        </div>

        <div className="bg-get-gray p-10 rounded-lg text-center border-2 border-dashed border-gray-300">
          <p className="text-gray-500 italic">Раздел формирования PDF-отчетов находится в разработке...</p>
        </div>
      </div>
    </div>
  );
};