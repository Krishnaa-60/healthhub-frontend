import React, { useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 bg-gray-800 dark:bg-dark-accent text-white dark:text-dark-bg py-3 px-5 rounded-lg shadow-xl flex items-center animate-fade-in-up z-50">
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-gray-700 dark:hover:bg-opacity-80">
        <CloseIcon className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
