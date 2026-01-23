import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 24, className = '' }) => {
  return (
    <div className="flex justify-center items-center w-full p-4">
      {/* 'animate-spin' es la clase mágica de Tailwind */}
      <Loader2
        size={size}
        className={`animate-spin text-blue-600 ${className}`}
      />
    </div>
  );
};
