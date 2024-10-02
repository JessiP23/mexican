import { useEffect, useRef } from 'react';

export default function Notification({ message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
          onClose();
        }, 2000); // Auto close after 2 seconds
    
        return () => clearTimeout(timer);
      }, [onClose]);
  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-fade-in-up">
      <div className="flex items-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    </div>
  );
}