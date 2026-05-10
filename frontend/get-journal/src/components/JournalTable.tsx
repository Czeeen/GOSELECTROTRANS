import React, { useState, useEffect } from 'react';
import { journalService } from '../services/journalService';

// Интерфейсы данных
interface Grade {
  date: string;
  mark: number | 'Н' | 'Б' | 'ДО' | null;
  reason: string;
  lessonId?: number; // ID урока для отправки на бэкенд
}

interface Student {
  id: number;
  name: string;
  grades: Grade[];
}

interface Lesson {
  id: number;
  date: string;
  topic: string;
}

// Пропсы компонента
interface JournalTableProps {
  userRole: 'admin' | 'teacher' | 'student';
  groupId: number;
  subjectId: number;
}

export const JournalTable: React.FC<JournalTableProps> = ({ 
  userRole, 
  groupId, 
  subjectId 
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const canEdit = userRole === 'admin' || userRole === 'teacher';

  // Загрузка данных при изменении groupId или subjectId
  useEffect(() => {
    if (groupId && subjectId) {
      loadGradesData();
    }
  }, [groupId, subjectId]);

  // Функция загрузки данных с бэкенда
  const loadGradesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await journalService.getGrades(groupId, subjectId);
      const { lessons: apiLessons, students: apiStudents, grades: gradesDict } = response.data;
      
      // Преобразуем уроки
      setLessons(apiLessons);
      setDates(apiLessons.map((l: Lesson) => l.date));
      
      // Преобразуем студентов и их оценки
      const formattedStudents = apiStudents.map((student: any) => {
        const studentGrades = apiLessons.map((lesson: Lesson) => {
          const key = `${lesson.id}-${student.id}`;
          const gradeData = gradesDict[key];
          return {
            date: lesson.date,
            mark: gradeData?.value ?? null,
            reason: '',
            lessonId: lesson.id
          };
        });
        
        return {
          id: student.id,
          name: `${student.last_name} ${student.first_name}`,
          grades: studentGrades
        };
      });
      
      setStudents(formattedStudents);
    } catch (err: any) {
      console.error('Ошибка загрузки журнала:', err);
      setError(err.response?.data?.message || 'Не удалось загрузить данные журнала');
    } finally {
      setLoading(false);
    }
  };

  // Добавление новой даты (урока)
  const addDate = async () => {
    if (!canEdit) return;
    
    const newDate = prompt('Введите дату в формате ДД.ММ:');
    if (!newDate) return;
    
    try {
      // Здесь должен быть вызов API для создания урока
      // Например: await journalService.createLesson({ date: newDate, groupId, subjectId });
      
      // Для демо: просто добавляем в локальный стейт
      if (!dates.includes(newDate)) {
        setDates([...dates, newDate].sort());
        // Обновляем оценки у всех студентов (пустые)
        setStudents(prev => prev.map(student => ({
          ...student,
          grades: [...student.grades, { date: newDate, mark: null, reason: '' }]
        })));
      } else {
        alert('Эта дата уже существует!');
      }
    } catch (err) {
      alert('Ошибка создания занятия');
      console.error(err);
    }
  };

  // Изменение оценки
  const handleGradeChange = async (
    studentId: number, 
    date: string, 
    mark: number | 'Н' | 'Б' | 'ДО' | null, 
    reason: string
  ) => {
    if (!canEdit) return;
    
    // Находим урок по дате
    const lesson = lessons.find(l => l.date === date);
    if (!lesson) return;
    
    try {
      // Отправляем обновление на бэкенд
      await journalService.updateGrade({
        lesson: lesson.id,
        student: studentId,
        value: typeof mark === 'number' ? mark : null,
        attendance: typeof mark === 'number' ? undefined : mark || undefined
      });
      
      // Обновляем локальный стейт для мгновенного отражения изменений
      setStudents(prevStudents => 
        prevStudents.map(student => {
          if (student.id !== studentId) return student;
          
          return {
            ...student,
            grades: student.grades.map(grade => {
              if (grade.date !== date) return grade;
              return { ...grade, mark, reason };
            })
          };
        })
      );
    } catch (err: any) {
      console.error('Ошибка сохранения оценки:', err);
      alert('Не удалось сохранить оценку. Проверьте соединение.');
    }
  };

  // Расчет среднего балла
  const calculateAverage = (grades: Grade[]) => {
    const numericGrades = grades
      .filter(g => typeof g.mark === 'number')
      .map(g => g.mark as number);
    
    if (numericGrades.length === 0) return '-';
    const avg = numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;
    return avg.toFixed(1);
  };

  // Проверка на стипендию
  const getsScholarship = (avg: string) => {
    if (avg === '-') return false;
    return parseFloat(avg) >= 4.0;
  };

  // Отображение состояния загрузки
  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#24305E]"></div>
        <span className="ml-3 text-gray-600">Загрузка журнала...</span>
      </div>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-medium">Ошибка загрузки данных</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={loadGradesData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-get-dark">Журнал успеваемости</h1>
        {canEdit && (
          <button 
            onClick={addDate}
            className="px-4 py-2 bg-[#24305E] text-white font-bold rounded-md hover:bg-[#1a2345] transition-colors"
          >
            + Добавить дату
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-get-gray border-b border-gray-300">
              <th className="p-4 font-semibold text-gray-700 border-r">ФИО Ученика</th>
              {dates.map((date) => (
                <th key={date} className="p-4 font-semibold text-center text-gray-700 border-r w-24">
                  {date}
                </th>
              ))}
              <th className="p-4 font-semibold text-center text-gray-700 border-r">Ср. балл</th>
              <th className="p-4 font-semibold text-center text-gray-700">Стипендия</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const avg = calculateAverage(student.grades);
              const scholarship = getsScholarship(avg);

              return (
                <tr key={student.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-r font-medium">{student.name}</td>
                  
                  {dates.map((date) => {
                    const gradeRecord = student.grades.find(g => g.date === date);
                    const currentMark = gradeRecord?.mark || null;
                    
                    return (
                      <td key={date} className="p-2 border-r text-center">
                        {canEdit ? (
                          <select
                            value={currentMark === null ? '' : String(currentMark)}
                            onChange={(e) => {
                              const value = e.target.value;
                              const mark: number | 'Н' | 'Б' | 'ДО' | null = 
                                value === '' ? null :
                                value === 'Н' ? 'Н' : 
                                value === 'Б' ? 'Б' : 
                                value === 'ДО' ? 'ДО' : 
                                parseInt(value);
                              const reason = prompt('Введите причину оценки (например, "Ответ у доски"):') || '';
                              handleGradeChange(student.id, date, mark, reason);
                            }}
                            className="w-full p-1 border rounded text-center cursor-pointer hover:bg-gray-50"
                          >
                            <option value="">-</option>
                            <option value="5">5</option>
                            <option value="4">4</option>
                            <option value="3">3</option>
                            <option value="2">2</option>
                            <option value="Н">Н</option>
                            <option value="Б">Б</option>
                            <option value="ДО">ДО</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded font-bold ${
                            currentMark === 5 ? 'text-green-600 bg-green-50' :
                            currentMark === 4 ? 'text-green-600 bg-green-50' :
                            currentMark === 3 ? 'text-yellow-600 bg-yellow-50' :
                            currentMark === 2 || currentMark === 'Н' ? 'text-get-red bg-red-50' :
                            'text-gray-400'
                          }`}>
                            {currentMark || '-'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  
                  <td className="p-4 border-r text-center font-bold text-gray-600">{avg}</td>
                  <td className="p-4 text-center">
                    {scholarship ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                        Назначена
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        Нет
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};