import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-[#AFCB37]',
    error: 'bg-[#E4032E]',
    warning: 'bg-[#FFBA00]',
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-get shadow-get z-50 animate-slide-up`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="hover:opacity-80">✕</button>
      </div>
    </div>
  );
};