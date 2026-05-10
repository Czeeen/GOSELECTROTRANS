import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

// Типы для ролей и ответа от бэкенда
export type Role = 'admin' | 'teacher' | 'curator' | 'student' | null;

interface LoginResponse {
  status: 'success' | 'error';
  role?: Role;
  username?: string;
  message?: string;
}

interface AuthContextType {
  role: Role;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // При загрузке приложения проверяем, есть ли сохраненная роль в localStorage
  // Это нужно, чтобы пользователь оставался в системе после перезагрузки страницы (F5)
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as Role;
    const savedUsername = localStorage.getItem('username');
    
    if (savedRole) {
      setRole(savedRole);
      if (savedUsername) setUsername(savedUsername);
    }
    setIsLoading(false);
  }, []);

  // Функция входа: отправляет данные на бэкенд
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Отправляем POST запрос на Django API
      const response = await api.post<LoginResponse>('/auth/login/', { 
        username, 
        password 
      });

      const { status, role: userRole, username: userName } = response.data;

      if (status === 'success' && userRole) {
        // Успех: сохраняем данные в состояние и localStorage
        setRole(userRole);
        if (userName) {
          setUsername(userName);
          localStorage.setItem('username', userName);
        }
        localStorage.setItem('userRole', userRole);
        return true;
      } else {
        // Бэкенд вернул ошибку (например, неверный пароль)
        alert(response.data.message || 'Ошибка входа');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Обработка сетевых ошибок или ошибок 401/403
      const msg = error.response?.data?.message || 'Не удалось подключиться к серверу';
      alert(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода: очищает сессию на бэкенде и локально
  const logout = async () => {
    try {
      // Пытаемся корректно завершить сессию на сервере
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если запрос упал (например, сеть пропала), мы все равно разлогиним пользователя локально
    } finally {
      // Полная очистка состояния
      setRole(null);
      setUsername(null);
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      // Принудительный редирект на главную, чтобы сбросить состояние роутера
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ role, username, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для удобного использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};