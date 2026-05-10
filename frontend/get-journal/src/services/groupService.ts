import api from './api';

export interface Group {
  id: number;
  name: string;
  subjects: number[];
  is_distance: boolean;
}

export interface Subject {
  id: number;
  nameRussian: string;
  nameEnglish: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  group: number;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'curator' | 'student';
  email?: string;
}

export const groupService = {
  getGroups: () => api.get<Group[]>('/groups/'),
  
  getGroupById: (id: number) => 
    api.get<Group>(`/groups/${id}/`),
  
  createGroup: (data: { name: string; subjects: number[]; is_distance?: boolean }) =>
    api.post<Group>('/groups/', data),
  
  getSubjects: () => api.get<Subject[]>('/subjects/'),
  
  getStudentsByGroup: (groupId: number) =>
    api.get<Student[]>(`/groups/${groupId}/students/`),
  
  createStudent: (data: { first_name: string; last_name: string; group: number }) =>
    api.post<Student>('/students/', data),
  
  // Для админа
  getAllUsers: () => api.get<User[]>('/users/'),
  getTeachers: () => api.get<User[]>('/users/?role=teacher'),
  getStudents: () => api.get<User[]>('/users/?role=student'),
};