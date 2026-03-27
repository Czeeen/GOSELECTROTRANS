import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminPanel = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-10">
      <h1 className="text-get-red">Панель администратора</h1>
      <button 
        onClick={() => { logout(); navigate('/'); }}
        className="mt-4 px-4 py-2 bg-gray-200 rounded"
      >
        Выйти
      </button>
    </div>
  );
};