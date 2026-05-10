import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// Интерфейс для стандартного ответа от бэкенда
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  [key: string]: any;
}

// Создаем экземпляр axios с базовой конфигурацией
export const api: AxiosInstance = axios.create({
  baseURL: '/api', // Vite proxy перенаправит это на http://127.0.0.1:8000/api
  withCredentials: true, // Обязательно для отправки cookie (сессии Django)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor для добавления CSRF токена (защита Django)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Проверка на существование document (для безопасности при SSR)
    if (typeof document !== 'undefined') {
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1];

      if (csrfToken && config.headers) {
        config.headers.set('X-CSRFToken', csrfToken);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor для обработки ответов и ошибок
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  (error) => {
    // Логирование ошибки для отладки
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }

    // Если ошибка 401 (не авторизован) — редирект на главную/логин
    if (error.response?.status === 401) {
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;