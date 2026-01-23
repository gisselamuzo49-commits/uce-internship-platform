import React from 'react';

// Fíjate que usamos "export const" para que coincida con las llaves { Skeleton }
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      {...props}
    />
  );
};
