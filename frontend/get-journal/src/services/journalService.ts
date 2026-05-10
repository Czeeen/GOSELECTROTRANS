import api from './api';

export const journalService = {
  getGroups: () => api.get('/groups/'),
  getSubjects: (groupId: number) => api.get(`/groups/${groupId}/subjects/`),
  getGrades: (groupId: number, subjectId: number) => 
    api.get(`/groups/${groupId}/subjects/${subjectId}/grades/`),
  updateGrade: (data: { lesson: number; student: number; value?: number | null; attendance?: string }) =>
    api.post('/grades/update/', data),
};