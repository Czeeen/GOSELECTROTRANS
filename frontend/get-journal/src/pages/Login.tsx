import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

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
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="bg-white p-8 rounded-get-lg shadow-get border border-[#E5E7EB] w-full max-w-sm flex flex-col">
        
        {/* Логотип и заголовок */}
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <img src={logo} alt="ГЭТ Логотип" className="w-40 h-auto" />
          <h1 className="text-[#24305E] text-2xl font-bold tracking-wide leading-tight">
            Электронный журнал
          </h1>
        </div>

        {/* Форма входа */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-get border border-[#E5E7EB] bg-[#F9FAFB] text-[#24305E] outline-none focus:border-[#009CBC] focus:ring-2 focus:ring-[#009CBC]/20 transition-all placeholder:text-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-get border border-[#E5E7EB] bg-[#F9FAFB] text-[#24305E] outline-none focus:border-[#009CBC] focus:ring-2 focus:ring-[#009CBC]/20 transition-all placeholder:text-gray-400"
            required
          />
          
          <button
            type="submit"
            className="mt-2 w-full bg-[#E4032E] hover:bg-[#B80224] active:scale-[0.98] text-white font-bold py-3 rounded-get transition-all duration-200 shadow-get hover:shadow-get-hover"
          >
            Войти
          </button>
        </form>

        {/* Брендлайн в футере */}
        <div className="mt-8 pt-4 border-t border-[#E5E7EB] text-center">
          <p className="text-sm text-[#6B7280] italic">«Всем по пути»</p>
        </div>
      </div>
    </div>
  );
};