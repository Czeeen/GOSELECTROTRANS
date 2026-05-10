import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { JournalTable } from '../components/JournalTable';
import { journalService } from '../services/journalService';

// Интерфейс для расписания
interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  subject: string;
  room: string;
  teacher: string;
}

export const StudentView = () => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'journal' | 'schedule'>('journal');
  
  // Состояния для данных студента
  const [groupId, setGroupId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Моковые данные для фоллбэка (если бэкенд ещё не готов)
  const mockSchedule: ScheduleItem[] = [
    { id: 1, day: 'Понедельник', time: '08:30 - 10:00', subject: 'Электротехника', room: '305', teacher: 'Иванов И.И.' },
    { id: 2, day: 'Понедельник', time: '10:30 - 12:00', subject: 'Основы автоматики', room: '401', teacher: 'Петров П.П.' },
    { id: 3, day: 'Среда', time: '09:00 - 10:30', subject: 'Электрические машины', room: '305', teacher: 'Иванов И.И.' },
    { id: 4, day: 'Четверг', time: '11:00 - 12:30', subject: 'Математика', room: '205', teacher: 'Сидорова А.А.' },
    { id: 5, day: 'Пятница', time: '08:30 - 10:00', subject: 'Основы автоматики', room: '401', teacher: 'Петров П.П.' },
  ];

  useEffect(() => {
    loadStudentData();
  }, []);

  // Загрузка данных студента с бэкенда
  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Получаем список групп (для демо берём первую, в реальности — фильтруем по студенту)
      const groupsRes = await journalService.getGroups();
      if (groupsRes.data.length > 0) {
        setGroupId(groupsRes.data[0].id);
        
        // 2. Получаем предметы для этой группы
        const subjectsRes = await journalService.getSubjects(groupsRes.data[0].id);
        if (subjectsRes.data.length > 0) {
          setSubjectId(subjectsRes.data[0].id);
        }
      }

      // 3. Загружаем расписание (если эндпоинт есть)
      try {
        // const scheduleRes = await journalService.getStudentSchedule();
        // setSchedule(scheduleRes.data);
        // Если эндпоинта ещё нет — используем моковые данные
        setSchedule(mockSchedule);
      } catch (scheduleErr) {
        console.warn('Расписание загружено из моковых данных:', scheduleErr);
        setSchedule(mockSchedule);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки данных студента:', err);
      setError('Не удалось загрузить данные. Попробуйте позже.');
      // На всякий случай подставляем моковые данные, чтобы интерфейс не был пустым
      setSchedule(mockSchedule);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Показываем лоадер при первой загрузке
  if (loading && !groupId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#24305E] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка личного кабинета...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#24305E]">Личный кабинет ученика</h2>
          {username && <p className="text-sm text-gray-500">{username}</p>}
        </div>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 text-sm font-medium text-white bg-get-red rounded-md hover:bg-red-700 transition-colors"
        >
          Выйти
        </button>
      </nav>

      {/* Вкладки навигации */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'journal'
                ? 'bg-[#24305E] text-white'
                : 'text-[#24305E] hover:bg-gray-100'
            }`}
          >
            Мой журнал
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'bg-[#24305E] text-white'
                : 'text-[#24305E] hover:bg-gray-100'
            }`}
          >
            Расписание
          </button>
        </div>
      </div>

      <main className="container mx-auto p-6">
        {/* Ошибка загрузки */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Ошибка</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={loadStudentData}
              className="mt-2 text-sm underline hover:text-red-800"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {activeTab === 'journal' ? (
          <>
            <div className="bg-blue-50 border-l-4 border-[#009CBC] p-4 mb-6 rounded-r">
              <p className="text-sm text-[#24305E]">
                Здесь вы можете видеть свои оценки и посещаемость. Редактирование недоступно.
              </p>
            </div>
            
            {/* JournalTable с обязательными пропсами */}
            {groupId && subjectId ? (
              <JournalTable 
                userRole="student" 
                groupId={groupId} 
                subjectId={subjectId} 
              />
            ) : (
              <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                <p>Данные журнала временно недоступны</p>
                <button 
                  onClick={loadStudentData}
                  className="mt-4 px-4 py-2 bg-[#24305E] text-white rounded hover:bg-[#1a2345] transition"
                >
                  Обновить
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-[#24305E] mb-6">Моё расписание</h2>
            
            {schedule.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Расписание пока пусто</p>
            ) : (
              <div className="space-y-4">
                {schedule.map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-[#24305E] text-lg">{item.subject}</h3>
                        <p className="text-gray-600">Преподаватель: {item.teacher}</p>
                        <p className="text-gray-600">Аудитория: {item.room}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-get-red">{item.day}</p>
                        <p className="text-gray-600">{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};