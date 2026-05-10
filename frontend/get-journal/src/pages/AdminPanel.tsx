import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Group {
  id: number;
  name: string;
  is_distance: boolean;
}

interface Subject {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  login: string;
  name: string;
  surname: string;
  assigned_groups: Group[];
  assigned_subjects: Subject[];
  curated_groups: Group[];
}

interface Student {
  id: number;
  login: string;
  name: string;
  surname: string;
  group: Group | null;
}

export const AdminPanel = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'groups' | 'teachers' | 'students'>('dashboard');
  
  // Состояния для данных
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Состояния для модальных окон
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showAssignCurator, setShowAssignCurator] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  // Состояния загрузки
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [groupsRes, teachersRes, studentsRes, subjectsRes] = await Promise.all([
        api.get('/groups/'),
        api.get('/teachers/'),
        api.get('/students/'),
        api.get('/subjects/all/'),
      ]);
      
      setGroups(groupsRes.data || []);
      setTeachers(teachersRes.data || []);
      setStudents(studentsRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.response?.data?.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Создание группы
  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const groupData = {
      name: formData.get('name'),
      is_distance: formData.get('is_distance') === 'on',
    };

    try {
      await api.post('/groups/', groupData);
      setShowCreateGroup(false);
      await loadData();
      alert('Группа успешно создана!');
    } catch (err: any) {
      alert('Ошибка создания группы: ' + (err.response?.data?.message || err.message));
    }
  };

  // Создание учителя с привязкой к группам и предметам
  const handleCreateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const assignedGroupIds = Array.from(formData.getAll('assigned_groups')).map(Number);
    const assignedSubjectIds = Array.from(formData.getAll('assigned_subjects')).map(Number);
    
    const teacherData = {
      login: formData.get('login'),
      password: formData.get('password'),
      name: formData.get('name'),
      surname: formData.get('surname'),
      role: 'teacher',
      assigned_group_ids: assignedGroupIds,
      assigned_subject_ids: assignedSubjectIds,
    };

    try {
      await api.post('/auth/register/', teacherData);
      setShowCreateTeacher(false);
      await loadData();
      alert('Учитель успешно создан!');
    } catch (err: any) {
      alert('Ошибка создания учителя: ' + (err.response?.data?.message || err.message));
    }
  };

  // Создание студента с привязкой к группе
  const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const studentData = {
      login: formData.get('login'),
      password: formData.get('password'),
      name: formData.get('name'),
      surname: formData.get('surname'),
      role: 'student',
      group_id: formData.get('group_id') ? Number(formData.get('group_id')) : null,
    };

    try {
      await api.post('/auth/register/', studentData);
      setShowCreateStudent(false);
      await loadData();
      alert('Студент успешно создан!');
    } catch (err: any) {
      alert('Ошибка создания студента: ' + (err.response?.data?.message || err.message));
    }
  };

  // Назначение учителя куратором групп
  const handleAssignCurator = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    
    const formData = new FormData(e.currentTarget);
    const curatedGroupIds = Array.from(formData.getAll('curated_groups')).map(Number);
    
    try {
      await api.post('/auth/update-teacher-assignments/', {
        teacher_id: selectedTeacher.id,
        curated_group_ids: curatedGroupIds,
      });
      setShowAssignCurator(false);
      setSelectedTeacher(null);
      await loadData();
      alert('Кураторство назначено!');
    } catch (err: any) {
      alert('Ошибка назначения: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading && groups.length === 0 && teachers.length === 0 && students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#24305E] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#24305E]">Панель администратора</h1>
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
          {[
            { key: 'dashboard', label: 'Главная' },
            { key: 'groups', label: 'Группы' },
            { key: 'teachers', label: 'Преподаватели' },
            { key: 'students', label: 'Студенты' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#24305E] text-white'
                  : 'text-[#24305E] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto p-6">
        {/* Ошибка */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Ошибка</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={loadData}
              className="mt-2 text-sm underline hover:text-red-800"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#24305E]">Панель управления</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-get-cyan text-white p-6 rounded-lg shadow">
                <div className="text-sm opacity-90">Всего групп</div>
                <div className="text-3xl font-bold mt-2">{groups.length}</div>
              </div>
              <div className="bg-get-green text-white p-6 rounded-lg shadow">
                <div className="text-sm opacity-90">Преподавателей</div>
                <div className="text-3xl font-bold mt-2">{teachers.length}</div>
              </div>
              <div className="bg-get-red text-white p-6 rounded-lg shadow">
                <div className="text-sm opacity-90">Студентов</div>
                <div className="text-3xl font-bold mt-2">{students.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#24305E]">Управление группами</h2>
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="px-4 py-2 bg-[#24305E] text-white font-bold rounded-md hover:bg-[#1a2345] transition-colors"
              >
                + Создать группу
              </button>
            </div>
            
            {groups.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Групп пока нет. Создайте первую!</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-get-gray">
                  <tr>
                    <th className="p-3 text-left">Название</th>
                    <th className="p-3 text-left">Тип</th>
                    <th className="p-3 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => (
                    <tr key={group.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{group.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          group.is_distance ? 'bg-get-cyan text-white' : 'bg-[#24305E] text-white'
                        }`}>
                          {group.is_distance ? 'Дистанционная' : 'Очная'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button className="text-get-cyan hover:underline mr-3">
                          Редактировать
                        </button>
                        <button className="text-get-red hover:underline">
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#24305E]">Преподаватели</h2>
              <button 
                onClick={() => setShowCreateTeacher(true)}
                className="px-4 py-2 bg-[#24305E] text-white font-bold rounded-md hover:bg-[#1a2345] transition-colors"
              >
                + Добавить учителя
              </button>
            </div>
            
            {teachers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Преподавателей пока нет. Добавьте первого!</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-get-gray">
                  <tr>
                    <th className="p-3 text-left">ФИО</th>
                    <th className="p-3 text-left">Логин</th>
                    <th className="p-3 text-left">Ведёт группы</th>
                    <th className="p-3 text-left">Ведёт предметы</th>
                    <th className="p-3 text-left">Курируемые</th>
                    <th className="p-3 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(teacher => (
                    <tr key={teacher.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{teacher.surname} {teacher.name}</td>
                      <td className="p-3">{teacher.login}</td>
                      <td className="p-3 text-sm">
                        {teacher.assigned_groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teacher.assigned_groups.slice(0, 3).map(g => (
                              <span key={g.id} className="px-2 py-0.5 bg-[#24305E] text-white rounded text-xs">
                                {g.name}
                              </span>
                            ))}
                            {teacher.assigned_groups.length > 3 && (
                              <span className="text-xs text-gray-500">+{teacher.assigned_groups.length - 3}</span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-sm">
                        {teacher.assigned_subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teacher.assigned_subjects.slice(0, 2).map(s => (
                              <span key={s.id} className="px-2 py-0.5 bg-get-cyan text-white rounded text-xs">
                                {s.name}
                              </span>
                            ))}
                            {teacher.assigned_subjects.length > 2 && (
                              <span className="text-xs text-gray-500">+{teacher.assigned_subjects.length - 2}</span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-sm">
                        {teacher.curated_groups.length > 0 ? (
                          <span className="px-2 py-1 bg-get-green text-white rounded text-xs">
                            {teacher.curated_groups.length} групп
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => { setSelectedTeacher(teacher); setShowAssignCurator(true); }}
                          className="text-get-cyan hover:underline mr-3"
                        >
                          Назначить куратором
                        </button>
                        <button className="text-get-red hover:underline">
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#24305E]">Студенты</h2>
              <button 
                onClick={() => setShowCreateStudent(true)}
                className="px-4 py-2 bg-[#24305E] text-white font-bold rounded-md hover:bg-[#1a2345] transition-colors"
              >
                + Добавить студента
              </button>
            </div>
            
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Студентов пока нет. Добавьте первого!</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-get-gray">
                  <tr>
                    <th className="p-3 text-left">ФИО</th>
                    <th className="p-3 text-left">Логин</th>
                    <th className="p-3 text-left">Группа</th>
                    <th className="p-3 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{student.surname} {student.name}</td>
                      <td className="p-3">{student.login}</td>
                      <td className="p-3">
                        {student.group ? (
                          <span className="px-2 py-1 bg-[#24305E] text-white rounded text-xs">
                            {student.group.name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        <button className="text-get-cyan hover:underline mr-3">
                          Редактировать
                        </button>
                        <button className="text-get-red hover:underline">
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Модальное окно: Создание группы */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-[#24305E] mb-4">Создать группу</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название группы
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                  placeholder="Например: ЭТ-301"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_distance"
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Дистанционная группа</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#24305E] text-white rounded-md hover:bg-[#1a2345] transition-colors"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно: Создание учителя */}
      {showCreateTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#24305E] mb-4">Добавить учителя</h3>
            <form onSubmit={handleCreateTeacher}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Логин
                </label>
                <input
                  type="text"
                  name="login"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия
                </label>
                <input
                  type="text"
                  name="surname"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                />
              </div>
              
              {/* Выбор групп для учителя */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ведёт группы
                </label>
                <select
                  name="assigned_groups"
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E] h-24"
                >
                  {groups.map(group => (
                    <option key={group.id} value={String(group.id)}>
                      {group.name} {group.is_distance && '(Дист.)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl/Cmd для выбора нескольких</p>
              </div>
              
              {/* Выбор предметов для учителя */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ведёт предметы
                </label>
                <select
                  name="assigned_subjects"
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E] h-24"
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={String(subject.id)}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl/Cmd для выбора нескольких</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#24305E] text-white rounded-md hover:bg-[#1a2345] transition-colors"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTeacher(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно: Создание студента */}
      {showCreateStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-[#24305E] mb-4">Добавить студента</h3>
            <form onSubmit={handleCreateStudent}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Логин
                </label>
                <input
                  type="text"
                  name="login"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия
                </label>
                <input
                  type="text"
                  name="surname"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                />
              </div>
              
              {/* Выбор группы для студента */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Группа
                </label>
                <select
                  name="group_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E]"
                >
                  <option value="">Выберите группу</option>
                  {groups.map(group => (
                    <option key={group.id} value={String(group.id)}>
                      {group.name} {group.is_distance && '(Дистанционная)'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#24305E] text-white rounded-md hover:bg-[#1a2345] transition-colors"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateStudent(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно: Назначение куратора */}
      {showAssignCurator && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-[#24305E] mb-4">
              Назначить куратором: {selectedTeacher.surname} {selectedTeacher.name}
            </h3>
            <form onSubmit={handleAssignCurator}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Курируемые группы
                </label>
                <select
                  name="curated_groups"
                  multiple
                  defaultValue={selectedTeacher.curated_groups.map(g => String(g.id))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#24305E] h-32"
                >
                  {groups.map(group => (
                    <option key={group.id} value={String(group.id)}>
                      {group.name} {group.is_distance && '(Дист.)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl/Cmd для выбора нескольких</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#24305E] text-white rounded-md hover:bg-[#1a2345] transition-colors"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAssignCurator(false); setSelectedTeacher(null); }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};