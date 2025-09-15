import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const colorClasses = {
  primary: 'border-blue-600',
  white: 'border-white',
  gray: 'border-gray-600'
};

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

// Composant de page de chargement complète
interface LoadingPageProps {
  message?: string;
  className?: string;
}

export function LoadingPage({ 
  message = "Chargement...", 
  className 
}: LoadingPageProps) {
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900",
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

// Composant de chargement inline
interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoading({ 
  message = "Chargement...", 
  size = 'sm',
  className 
}: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  );
}