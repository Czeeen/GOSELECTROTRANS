import React, { useState } from 'react';

// Моковые данные для примера
const mockStudents = [
  { id: 1, name: 'Иванов Иван', grades: [{ date: '01.09', mark: 5, reason: 'Ответ у доски' }, { date: '02.09', mark: 4, reason: 'Самостоятельная работа' }] },
  { id: 2, name: 'Петров Петр', grades: [{ date: '01.09', mark: 'Н', reason: 'Болел' }, { date: '02.09', mark: 5, reason: 'Лабораторная' }] },
];

const dates = ['01.09', '02.09', '03.09'];

export const JournalTable = ({ userRole }: { userRole: 'admin' | 'teacher' | 'student' }) => {
  const canEdit = userRole === 'admin' || userRole === 'teacher';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-get-dark">Журнал успеваемости</h1>
        <span className="px-3 py-1 bg-get-red text-white rounded-md text-sm">
          Теоретический курс
        </span>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-get-gray border-b border-gray-300">
              <th className="p-4 font-semibold text-gray-700 border-r">ФИО Ученика</th>
              {dates.map((date) => (
                <th key={date} className="p-4 font-semibold text-center text-gray-700 border-r w-16">
                  {date}
                </th>
              ))}
              <th className="p-4 font-semibold text-center text-gray-700 border-r">Ср. балл</th>
              <th className="p-4 font-semibold text-center text-gray-700">Стипендия</th>
            </tr>
          </thead>
          <tbody>
            {mockStudents.map((student) => {
              // Простейший расчет среднего балла (игнорируя 'Н')
              const numGrades = student.grades.filter(g => typeof g.mark === 'number').map(g => g.mark as number);
              const avg = numGrades.length ? (numGrades.reduce((a, b) => a + b, 0) / numGrades.length).toFixed(1) : '-';
              const getsScholarship = avg !== '-' && parseFloat(avg) >= 4.0;

              return (
                <tr key={student.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-r font-medium">{student.name}</td>
                  
                  {dates.map((date) => {
                    const gradeRecord = student.grades.find(g => g.date === date);
                    return (
                      <td key={date} className="p-2 border-r text-center relative group">
                        {gradeRecord ? (
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold cursor-pointer
                            ${typeof gradeRecord.mark === 'number' && gradeRecord.mark > 3 ? 'text-green-600' : 'text-get-red'}
                            ${canEdit ? 'hover:bg-gray-200' : ''}`}>
                            {gradeRecord.mark}
                            
                            {/* Tooltip с причиной оценки */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                              {gradeRecord.reason}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        ) : (
                          canEdit && <button className="w-8 h-8 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded">+</button>
                        )}
                      </td>
                    );
                  })}
                  
                  <td className="p-4 border-r text-center font-bold text-gray-600">{avg}</td>
                  <td className="p-4 text-center">
                    {getsScholarship ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Назначена</span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">Нет</span>
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