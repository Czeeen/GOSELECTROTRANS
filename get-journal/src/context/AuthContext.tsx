import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'admin' | 'teacher' | 'curator' | 'student' | null;

interface AuthContextType {
  role: Role;
  login: (username: string, password?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(null);

  const login = (username: string, password?: string) => {
    // Приводим к нижнему регистру и убираем пробелы
    const user = username.toLowerCase().trim();
    const pass = password?.toLowerCase().trim();

    if (user !== pass) {
      alert('Логин и пароль должны совпадать!');
      return;
    }

    // Словарь соответствия русских слов и системных ролей
    const roles: Record<string, Role> = { 
      'админ': 'admin', 
      'учитель': 'teacher', 
      'куратор': 'curator', 
      'ученик': 'student' 
    };

    if (roles[user]) {
      setRole(roles[user]);
    } else {
      alert('Пользователь не найден. Введите: админ, учитель, куратор или ученик');
    }
  };

  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};