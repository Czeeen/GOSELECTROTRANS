import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CuratorDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'reports'>('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Моковые данные
  const scholarshipStudents = [
    { id: 1, name: 'Иванов Иван', group: 'ЭТ-301', avgGrade: 4.8, scholarship: 2500 },
  ];

  const debtors = [
    { id: 2, name: 'Петров Петр', group: 'ЭТ-301', avgGrade: 2.8, debts: ['Электротехника'] },
  ];

  const curatedGroups = [
    { id: 1, name: 'ЭТ-301', students: 25, avgGrade: 4.2, scholarshipCount: 15 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#24305E]">Отчеты куратора</h1>
          <p className="text-gray-500">Мониторинг успеваемости и стипендиальный фонд</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 text-sm font-medium text-white bg-get-red rounded-md hover:bg-red-700 transition-colors"
        >
          Выйти
        </button>
      </nav>

      {/* Вкладки навигации - только рабочие кнопки */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#24305E] text-white'
                : 'text-[#24305E] hover:bg-gray-100'
            }`}
          >
            Обзор
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-[#24305E] text-white'
                : 'text-[#24305E] hover:bg-gray-100'
            }`}
          >
            Курируемые группы
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-[#24305E] text-white'
                : 'text-[#24305E] hover:bg-gray-100'
            }`}
          >
            Отчеты
          </button>
        </div>
      </div>

      <main className="container mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-green-600 text-sm font-bold uppercase">Стипендиаты</div>
                <div className="text-3xl font-black">{scholarshipStudents.length}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Общая сумма: {scholarshipStudents.reduce((sum, s) => sum + s.scholarship, 0)} ₽
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="text-get-red text-sm font-bold uppercase">Должники</div>
                <div className="text-3xl font-black">{debtors.length}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-gray-600 text-sm font-bold uppercase">Средний балл</div>
                <div className="text-3xl font-black">
                  {(curatedGroups.reduce((sum, g) => sum + g.avgGrade, 0) / curatedGroups.length).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Стипендиаты */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-[#24305E] mb-4">Стипендиаты</h2>
              <table className="min-w-full">
                <thead className="bg-get-gray">
                  <tr>
                    <th className="p-3 text-left">ФИО</th>
                    <th className="p-3 text-left">Группа</th>
                    <th className="p-3 text-left">Средний балл</th>
                    <th className="p-3 text-left">Стипендия</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarshipStudents.map(student => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{student.name}</td>
                      <td className="p-3">{student.group}</td>
                      <td className="p-3 font-bold text-green-600">{student.avgGrade}</td>
                      <td className="p-3">{student.scholarship} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Должники */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-[#24305E] mb-4 text-get-red">Должники</h2>
              <table className="min-w-full">
                <thead className="bg-get-gray">
                  <tr>
                    <th className="p-3 text-left">ФИО</th>
                    <th className="p-3 text-left">Группа</th>
                    <th className="p-3 text-left">Средний балл</th>
                    <th className="p-3 text-left">Задолженности</th>
                  </tr>
                </thead>
                <tbody>
                  {debtors.map(student => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{student.name}</td>
                      <td className="p-3">{student.group}</td>
                      <td className="p-3 font-bold text-get-red">{student.avgGrade}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {student.debts.map((debt, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-100 text-get-red rounded text-xs">
                              {debt}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-[#24305E] mb-6">Курируемые группы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {curatedGroups.map(group => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-[#24305E] text-lg mb-2">{group.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Студентов: <span className="font-semibold">{group.students}</span></p>
                    <p>Средний балл: <span className="font-semibold text-green-600">{group.avgGrade}</span></p>
                    <p>Стипендиатов: <span className="font-semibold text-get-cyan">{group.scholarshipCount}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-[#24305E] mb-6">Формирование отчетов</h2>
            <div className="space-y-4">
              <button 
                onClick={() => alert('Отчет сформирован и скачан!')}
                className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <h3 className="font-bold text-[#24305E]">Отчет по успеваемости</h3>
                <p className="text-gray-600 text-sm mt-1">Скачать отчет по всем группам в формате PDF</p>
              </button>
              <button 
                onClick={() => alert('Отчет по стипендиям сформирован!')}
                className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <h3 className="font-bold text-[#24305E]">Отчет по стипендиальному фонду</h3>
                <p className="text-gray-600 text-sm mt-1">Скачать отчет о назначенных стипендиях</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};