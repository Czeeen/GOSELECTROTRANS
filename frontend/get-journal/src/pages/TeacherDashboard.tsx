import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { JournalTable } from '../components/JournalTable';
import api from '../services/api';

// Интерфейсы для данных
interface Group {
  id: number;
  name: string;
  is_distance: boolean;
}

interface Subject {
  id: number;
  name: string;
}

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  subject: string;
  room: string;
  group: string;
}

interface TeacherData {
  id: number;
  assigned_groups: Group[];
  assigned_subjects: Subject[];
  curated_groups: Group[];
}

export const TeacherDashboard = () => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  
  // Состояния навигации
  const [activeTab, setActiveTab] = useState<'journal' | 'schedule' | 'curated'>('journal');
  
  // Состояния для данных учителя
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  
  // Состояния для выбора группы/предмета в журнале
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  
  // Состояния для расписания и кураторства
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [curatedStats, setCuratedStats] = useState<any[]>([]);
  
  // Общие состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadTeacherData();
  }, []);

  // Загрузка данных учителя с бэкенда
  const loadTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Получаем данные текущего учителя (назначения)
      const teacherRes = await api.get('/teachers/me/');
      setTeacherData(teacherRes.data);
      
      // Автовыбор первой группы и предмета, если есть
      if (teacherRes.data.assigned_groups?.length > 0 && !selectedGroup) {
        setSelectedGroup(teacherRes.data.assigned_groups[0].id);
      }
      if (teacherRes.data.assigned_subjects?.length > 0 && !selectedSubject) {
        setSelectedSubject(teacherRes.data.assigned_subjects[0].id);
      }
      
      // 2. Загружаем расписание (только назначенные предметы и группы)
      if (teacherRes.data.assigned_groups?.length > 0 && teacherRes.data.assigned_subjects?.length > 0) {
        await loadSchedule(teacherRes.data.assigned_groups, teacherRes.data.assigned_subjects);
      }
      
      // 3. Если есть курируемые группы — загружаем статистику
      if (teacherRes.data.curated_groups?.length > 0) {
        await loadCuratedStats(teacherRes.data.curated_groups);
      }
      
    } catch (err: any) {
      console.error('Ошибка загрузки данных преподавателя:', err);
      setError(err.response?.data?.message || 'Не удалось загрузить данные. Проверьте соединение с сервером.');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка расписания для назначенных групп и предметов
  const loadSchedule = async (groups: Group[], subjects: Subject[]) => {
    try {
      const scheduleData: ScheduleItem[] = [];
      
      // Для каждой комбинации группа-предмет загружаем уроки
      for (const group of groups) {
        for (const subject of subjects) {
          try {
            const res = await api.get(`/groups/${group.id}/subjects/${subject.name}/table/`);
            const lessons = res.data.lessons || [];
            
            lessons.forEach((lesson: any) => {
              scheduleData.push({
                id: lesson.id,
                day: getDayName(lesson.date),
                time: '08:30 - 10:00', // Заглушка, если время не хранится
                subject: subject.name,
                room: '305', // Заглушка
                group: group.name,
              });
            });
          } catch (e) {
            // Если данных нет — пропускаем
            console.warn(`Нет данных для ${group.name} / ${subject.name}`);
          }
        }
      }
      
      // Сортируем по дню и времени
      scheduleData.sort((a, b) => {
        const dayOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      });
      
      setSchedule(scheduleData);
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
    }
  };

  // Загрузка статистики для курируемых групп
  const loadCuratedStats = async (groups: Group[]) => {
    try {
      const stats = [];
      for (const group of groups) {
        try {
          const res = await api.get(`/groups/${group.id}/payout/`);
          stats.push({
            group: group.name,
            avgGrade: res.data.results?.[0]?.avg_grade || '-',
            scholarshipCount: res.data.results?.filter((r: any) => r.scholarship > 0)?.length || 0,
            totalStudents: res.data.results?.length || 0,
          });
        } catch (e) {
          console.warn(`Нет данных стипендий для ${group.name}`);
        }
      }
      setCuratedStats(stats);
    } catch (err) {
      console.error('Ошибка загрузки статистики куратора:', err);
    }
  };

  // Вспомогательная функция: получаем название дня недели из даты
  const getDayName = (dateStr: string): string => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const [day, month] = dateStr.split('.').map(Number);
    const date = new Date(2026, (month || 1) - 1, day || 1);
    return days[date.getDay()];
  };

  // Обработчик смены группы
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(Number(e.target.value));
    setSelectedSubject(null); // Сбрасываем предмет при смене группы
  };

  // Обработчик смены предмета
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(Number(e.target.value));
  };

  // Выход из системы
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Показываем лоадер при первой загрузке
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#24305E] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка панели преподавателя...</p>
        </div>
      </div>
    );
  }

  // Получаем отфильтрованные списки для селектов
  const availableGroups = teacherData?.assigned_groups || [];
  const availableSubjects = teacherData?.assigned_subjects || [];
  const hasCuratedGroups = (teacherData?.curated_groups?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#24305E]">Панель преподавателя</h2>
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
            Журнал
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
          {hasCuratedGroups && (
            <button
              onClick={() => setActiveTab('curated')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'curated'
                  ? 'bg-[#24305E] text-white'
                  : 'text-[#24305E] hover:bg-gray-100'
              }`}
            >
              Курируемые группы
            </button>
          )}
        </div>
      </div>

      <main className="container mx-auto p-6">
        {/* Ошибка загрузки */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Ошибка</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={loadTeacherData}
              className="mt-2 text-sm underline hover:text-red-800"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {activeTab === 'journal' && (
          <div>
            {/* Панель выбора группы и предмета */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#24305E] mb-1">
                    Группа
                  </label>
                  <select
                    value={selectedGroup || ''}
                    onChange={handleGroupChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CBC] bg-white"
                    disabled={loading || availableGroups.length === 0}
                  >
                    <option value="">Выберите группу</option>
                    {availableGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name} {group.is_distance && '(Дистанционная)'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#24305E] mb-1">
                    Предмет
                  </label>
                  <select
                    value={selectedSubject || ''}
                    onChange={handleSubjectChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CBC] bg-white"
                    disabled={!selectedGroup || loading || availableSubjects.length === 0}
                  >
                    <option value="">Выберите предмет</option>
                    {availableSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Таблица журнала */}
            {selectedGroup && selectedSubject ? (
              <JournalTable 
                userRole="teacher" 
                groupId={selectedGroup} 
                subjectId={selectedSubject} 
              />
            ) : (
              <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                <p>Выберите группу и предмет для просмотра журнала</p>
                {availableGroups.length === 0 && (
                  <p className="text-sm text-get-red mt-2">
                    Вам ещё не назначены группы. Обратитесь к администратору.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-[#24305E] mb-6">Моё расписание</h2>
            
            {schedule.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Расписание пока пусто. Убедитесь, что вам назначены группы и предметы.
              </p>
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
                        <p className="text-gray-600">Группа: {item.group}</p>
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

        {activeTab === 'curated' && hasCuratedGroups && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-[#24305E] mb-6">Курируемые группы</h2>
            
            {curatedStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Загрузка статистики...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {curatedStats.map((stat, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-[#24305E] text-lg mb-3">{stat.group}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Студентов:</span>
                        <span className="font-semibold">{stat.totalStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Средний балл:</span>
                        <span className={`font-semibold ${
                          stat.avgGrade >= 4 ? 'text-green-600' : 
                          stat.avgGrade >= 3 ? 'text-yellow-600' : 'text-get-red'
                        }`}>
                          {stat.avgGrade}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Стипендиатов:</span>
                        <span className="font-semibold text-get-cyan">{stat.scholarshipCount}</span>
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