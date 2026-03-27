import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Финальная версия: сплюснутые формы, сближенные элементы, точные пересечения
const GetLogo = () => (
  <svg width="85" height="75" viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00b3cb" />
        <stop offset="100%" stopColor="#007fa8" />
      </linearGradient>
      <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ea5551" />
        <stop offset="100%" stopColor="#ca1732" />
      </linearGradient>
      <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#094e7d" />
        <stop offset="100%" stopColor="#1f2951" />
      </linearGradient>
    </defs>

    {/* 1. ПЕРВАЯ СКОБКА (Бирюзовая) - Сплюснута по горизонтали */}
    <polyline 
      points="55,25 70,50 55,75" 
      fill="none" 
      stroke="url(#grad-cyan)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />

    {/* 2. ВТОРАЯ СКОБКА (Красная) - Поставлена ближе к первой */}
    <polyline 
      points="73,25 88,50 73,75" 
      fill="none" 
      stroke="url(#grad-red)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />

    {/* 3. ПЕРВЫЙ СЛЭШ - Пересекает ТОЛЬКО нижний кончик первой скобки */}
    <line 
      x1="25" y1="25" 
      x2="55" y2="75" 
      stroke="url(#grad-blue)" 
      strokeWidth="8" 
      strokeLinecap="round"
    />

    {/* 4. ВТОРОЙ СЛЭШ - Проходит левее верха первой скобки, 
        пересекает её ниже центра (Y=60) и попадает в кончик второй */}
    <line 
      x1="43" y1="25" 
      x2="73" y2="75" 
      stroke="url(#grad-blue)" 
      strokeWidth="8" 
      strokeLinecap="round"
    />
  </svg>
);

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'teacher') navigate('/teacher');
    else if (role === 'curator') navigate('/curator');
    else if (role === 'student') navigate('/student');
  }, [role, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 w-full max-w-sm flex flex-col">
        
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <GetLogo />
          <h1 className="text-[#24305e] text-2xl font-bold tracking-wide leading-tight">
            ГЭТ <br/> Электронный журнал
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-[#00b3cb] focus:ring-1 focus:ring-[#00b3cb] transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-[#00b3cb] focus:ring-1 focus:ring-[#00b3cb] transition-colors"
            required
          />
          
          <button
            type="submit"
            className="mt-2 w-full bg-[#24305e] hover:bg-[#1a2344] active:scale-[0.98] text-white font-bold py-3 rounded-md transition-all duration-200 shadow-md"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};