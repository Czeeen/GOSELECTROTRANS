import api from './api';

export interface Grade {
  id: number;
  student: number;
  lesson: number;
  value: number | null;
  attendance: 'present' | 'absent' | 'sick' | 'do';
  reason?: string;
}

export interface Lesson {
  id: number;
  date: string;
  topic: string;
  subject: number;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  group: number;
}

export const gradeService = {
  getGradesByLesson: (lessonId: number) => 
    api.get<Grade[]>(`/grades/lesson/${lessonId}/`),
  
  updateGrade: (data: Partial<Grade> & { lesson: number; student: number }) =>
    api.post<Grade>('/grades/update/', data),
  
  createGrade: (data: Omit<Grade, 'id'>) =>
    api.post<Grade>('/grades/', data),
  
  getLessonsBySubject: (subjectId: number) =>
    api.get<Lesson[]>(`/lessons/subject/${subjectId}/`),
  
  createLesson: (data: { date: string; topic: string; subject: number }) =>
    api.post<Lesson>('/lessons/', data),
};