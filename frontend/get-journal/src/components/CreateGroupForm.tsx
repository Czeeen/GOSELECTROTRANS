import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { groupService, type Subject } from '../services/groupService';

interface CreateGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [isDistance, setIsDistance] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen]);

  const loadSubjects = async () => {
    try {
      const response = await groupService.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      setError('Ошибка загрузки предметов');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await groupService.createGroup({
        name,
        subjects: selectedSubjects,
        is_distance: isDistance,
      });
      onSuccess();
      setName('');
      setSelectedSubjects([]);
      setIsDistance(false);
    } catch (error) {
      setError('Ошибка создания группы');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Создание новой группы"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-get-red rounded-get text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-get-dark mb-1">
            Название группы *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-get"
            placeholder="Например: ЭТ-301"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-get-dark mb-2">
            Предметы *
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-get-border rounded-get p-3">
            {subjects.map((subject) => (
              <label key={subject.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.id)}
                  onChange={() => toggleSubject(subject.id)}
                  className="w-4 h-4 text-get-red border-gray-300 rounded focus:ring-get-red"
                />
                <span className="ml-2 text-sm text-get-dark">
                  {subject.nameRussian}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDistance}
              onChange={(e) => setIsDistance(e.target.checked)}
              className="w-4 h-4 text-get-red border-gray-300 rounded focus:ring-get-red"
            />
            <span className="ml-2 text-sm text-get-dark">
              Дистанционная группа
            </span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-get-border text-get-dark rounded-get hover:bg-get-gray transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-get disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </form>
    </Modal>
  );
};