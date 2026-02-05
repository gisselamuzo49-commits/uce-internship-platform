// Notification toast component for success/error messages
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-emerald-50' : 'bg-rose-50';
  const borderColor = isSuccess ? 'border-emerald-200' : 'border-rose-200';
  const textColor = isSuccess ? 'text-emerald-800' : 'text-rose-800';
  const iconColor = isSuccess ? 'text-emerald-500' : 'text-rose-500';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-[10000] flex items-start max-w-sm p-4 rounded-xl border shadow-lg ${bgColor} ${borderColor} animate-in slide-in-from-right-full`}
    >
      <Icon className={`flex-shrink-0 mr-3 ${iconColor}`} size={24} />
      <div className="flex-1 pt-0.5 mr-2">
        <p className={`text-sm font-bold ${textColor}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ml-auto inline-flex ${iconColor} hover:text-slate-700 focus:outline-none`}
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default Notification;
